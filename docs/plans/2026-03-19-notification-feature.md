# 即時通知功能 — 實施計劃

**Goal:** 為訂單管理系統加入即時通知功能，支援多用戶協作場景。當其他用戶執行操作（建立訂單、更改狀態、更新產品庫存、新增客戶等），所有在線用戶即時收到通知。

**Architecture:** Socket.IO 建立 WebSocket 連接，Express server 作為 event hub。每個 route handler 完成資料操作後 emit event，所有已連接 client 收到通知。通知同時寫入 SQLite 做持久化，支援離線用戶登入後補收。

**Tech Stack（新增）:** socket.io（server）、socket.io-client（client）、uuid（用戶識別）

**預計總工時：** 3-4 個開發 session

---

## 前置概念：用戶識別（Lightweight User Identity）

由於系統無完整 auth，採用以下方案：
- 首次使用時產生 `uuid` 存入 `localStorage`，搭配用戶自選暱稱
- Server 端維護 `users` table 記錄 user_id + display_name
- Socket.IO 連接時帶上 user_id，server 記錄 active connections
- 未來可無縫升級至 JWT auth

---

## Task 1: 安裝依賴

**複雜度：** ⭐ (低)
**依賴：** 無

```bash
npm install socket.io socket.io-client uuid
```

---

## Task 2: 資料庫 Schema 擴展

**複雜度：** ⭐⭐ (中低)
**依賴：** 無
**檔案：** `server/database.js`

新增三張表：

### users 表
```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,              -- UUID
  display_name TEXT NOT NULL,
  last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### notifications 表
```sql
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,                -- 'order_created' | 'order_status_changed' | 'order_cancelled' | 'product_updated' | 'product_stock_low' | 'customer_created' | 'customer_updated'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT NOT NULL,         -- 'order' | 'product' | 'customer'
  entity_id INTEGER,
  actor_id TEXT,                     -- 執行操作的 user_id
  actor_name TEXT,                   -- denormalized
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
```

### notification_reads 表
```sql
CREATE TABLE IF NOT EXISTS notification_reads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  notification_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
  UNIQUE(notification_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_reads_user ON notification_reads(user_id);
```

**設計決策：**
- `notification_reads` 用 separate table，因為多用戶場景下每個用戶有獨立的已讀狀態
- `actor_name` denormalized 存入，避免每次查詢都 JOIN
- notifications 採用 broadcast model，所有用戶可見，只有已讀狀態因人而異

---

## Task 3: Socket.IO Server 整合

**複雜度：** ⭐⭐⭐ (中)
**依賴：** Task 1, Task 2
**檔案：** `server/index.js`（改）、`server/socket.js`（新）

### Step 1: 建立 `server/socket.js`
- 初始化 Socket.IO server
- 處理 connection/disconnect
- Upsert user record
- 提供 `emitNotification()` 工具函數：寫入 DB + 廣播

### Step 2: 修改 `server/index.js`
- `app.listen()` 改為 `http.createServer(app)` + `server.listen()`
- 呼叫 `initSocket(server)`

### Step 3: 更新 `vite.config.js`
- 加入 WebSocket proxy：`'/socket.io': { target: 'http://localhost:3001', ws: true }`

---

## Task 4: Route Handlers 加入通知觸發

**複雜度：** ⭐⭐ (中低)
**依賴：** Task 3
**檔案：** `server/routes/orders.js`、`server/routes/products.js`、`server/routes/customers.js`

每個 handler 從 `x-user-id` / `x-user-name` header 讀取身份，操作完成後呼叫 `emitNotification()`。

| Endpoint | 通知類型 | 標題範例 |
|----------|----------|----------|
| `POST /api/orders` | `order_created` | 新訂單 #123 已建立 |
| `PATCH /api/orders/:id/status` | `order_status_changed` | 訂單 #123 狀態更新為「處理中」 |
| `DELETE /api/orders/:id` | `order_deleted` | 訂單 #123 已刪除 |
| `POST /api/products` | `product_created` | 新產品「無線耳機」已新增 |
| `PUT /api/products/:id` | `product_updated` | 產品「無線耳機」已更新 |
| `DELETE /api/products/:id` | `product_deleted` | 產品「無線耳機」已刪除 |
| `POST /api/customers` | `customer_created` | 新客戶「張小明」已新增 |
| `PUT /api/customers/:id` | `customer_updated` | 客戶「張小明」資訊已更新 |
| `DELETE /api/customers/:id` | `customer_deleted` | 客戶「張小明」已刪除 |

額外：訂單建立後檢查庫存 ≤ 5 觸發 `product_stock_low` 通知。

---

## Task 5: 通知 REST API

**複雜度：** ⭐⭐ (中低)
**依賴：** Task 2
**檔案：** `server/routes/notifications.js`（新）

| Method | Endpoint | 用途 |
|--------|----------|------|
| GET | `/api/notifications?limit=20&offset=0` | 通知列表（含已讀狀態） |
| GET | `/api/notifications/unread-count` | 未讀數量 |
| POST | `/api/notifications/:id/read` | 標記單條已讀 |
| POST | `/api/notifications/read-all` | 全部已讀 |

---

## Task 6: 前端 — 用戶識別 Context

**複雜度：** ⭐⭐ (中低)
**依賴：** Task 1
**檔案：** `src/contexts/UserContext.jsx`（新）、`src/api.js`（新）、`src/App.jsx`（改）

- 檢查 `localStorage` 有無 `userId`，無則產生 UUID + 彈 modal 要求輸入暱稱
- 建立 `apiFetch()` wrapper，自動注入 `x-user-id` / `x-user-name` header
- 將現有所有 `fetch('/api/...')` 改為 `apiFetch`

---

## Task 7: 前端 — Socket.IO 連接 + 通知 Context

**複雜度：** ⭐⭐⭐ (中)
**依賴：** Task 3, Task 5, Task 6
**檔案：** `src/contexts/NotificationContext.jsx`（新）、`src/hooks/useSocket.js`（新）

提供：
- `notifications` — 最近 50 條通知
- `unreadCount` — 未讀數量
- `markAsRead(id)` / `markAllRead()`
- `isConnected` — WebSocket 連接狀態

收到 event 時：忽略自己的操作（`actor_id === currentUserId`），其餘 prepend 到列表。

---

## Task 8: 前端 — 通知鈴鐺 + 下拉面板 UI

**複雜度：** ⭐⭐⭐ (中)
**依賴：** Task 7
**檔案：** `src/components/NotificationPanel.jsx`（新）、`src/components/Layout.jsx`（改）

- Bell icon badge 顯示 unreadCount（99+）
- 下拉面板：380px 寬，480px 高，scroll
- 每條通知：類型 icon + title + message + relative time + 未讀藍點
- 點擊通知：標記已讀 + 導航至對應頁面
- 「全部已讀」按鈕

通知類型 Icon 對映：

| type | icon | 顏色 |
|------|------|------|
| order_created | ShoppingCart | blue |
| order_status_changed | RefreshCw | amber |
| order_cancelled/deleted | XCircle | red |
| product_created/updated | Package | emerald |
| product_stock_low | AlertTriangle | orange |
| customer_created/updated | UserPlus | purple |
| customer/product_deleted | Trash2 | red |

---

## Task 9: Toast 整合即時通知

**複雜度：** ⭐ (低)
**依賴：** Task 7, Task 8

收到其他用戶通知時觸發 toast：`[actor_name] title`。
需將 `ToastProvider` 提升到 Layout 最外層。

---

## Task 10: 清理 + 效能優化

**複雜度：** ⭐⭐ (中低)
**依賴：** Task 1-9 全部完成

- **自動清理：** 刪除 30 天前通知
- **資料刷新：** 收到通知時，對應頁面自動重新 fetch
- **連接狀態：** Header 小圓點顯示 WebSocket 連線狀態

---

## 實施順序

```
Task 1 (安裝) → Task 2 (DB schema) → Task 3 (Socket server)
                                         ↓
Task 6 (User context) ──────────→ Task 4 (Route handlers)
                                         ↓
                                  Task 5 (Notification API)
                                         ↓
                                  Task 7 (Notification context)
                                         ↓
                                  Task 8 (UI panel)
                                         ↓
                                  Task 9 (Toast 整合)
                                         ↓
                                  Task 10 (清理 + 優化)
```

Task 1、2、6 可以平行進行。

---

## 檔案變更總覽

### 新增（8 個）
| 檔案 | 用途 |
|------|------|
| `server/socket.js` | Socket.IO server + emitNotification |
| `server/routes/notifications.js` | 通知 REST API |
| `src/contexts/UserContext.jsx` | 用戶識別 context |
| `src/contexts/NotificationContext.jsx` | 通知狀態 + Socket.IO client |
| `src/hooks/useSocket.js` | Socket.IO client hook |
| `src/components/NotificationPanel.jsx` | 通知下拉面板 UI |
| `src/components/UserSetupModal.jsx` | 首次暱稱設定 modal |
| `src/api.js` | fetch wrapper（自動帶 user header） |

### 修改（8 個）
| 檔案 | 改動 |
|------|------|
| `server/database.js` | 新增 3 張表 |
| `server/index.js` | http.createServer + Socket.IO |
| `server/routes/orders.js` | 加 emitNotification |
| `server/routes/products.js` | 加 emitNotification |
| `server/routes/customers.js` | 加 emitNotification |
| `vite.config.js` | WebSocket proxy |
| `src/App.jsx` | 包裹 providers |
| `src/components/Layout.jsx` | Bell badge + NotificationPanel |

---

## 未來擴展
1. JWT Auth 系統
2. 通知偏好設定（用戶可選擇接收類型）
3. Browser Push Notification
4. 通知獨立頁面（篩選、搜尋、分頁）
5. @mention 功能
6. Redis Pub/Sub（水平擴展）
