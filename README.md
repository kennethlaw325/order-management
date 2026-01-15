# 訂單管理系統 (Order Management System)

一個現代化的全端訂單管理系統，採用深色主題設計，適合個人或小型企業使用。

![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Preview)

## ✨ 功能特色

- **儀表板** - 訂單統計、收入概覽、庫存警示
- **訂單管理** - CRUD 操作、狀態追蹤、多品項訂單
- **客戶管理** - 客戶資料與訂單歷史
- **產品管理** - 產品目錄與庫存追蹤

## 🛠️ 技術棧

| 層級 | 技術 |
|------|------|
| 前端 | React + Vite |
| 樣式 | Vanilla CSS (深色主題) |
| 後端 | Node.js + Express |
| 資料庫 | SQLite |

## 🚀 快速開始

### 前置需求

- Node.js 18+ 

### 安裝

```bash
# 克隆專案
git clone https://github.com/YOUR_USERNAME/order-management.git
cd order-management

# 安裝依賴
npm install
```

### 執行

```bash
# 終端 1：啟動後端伺服器
npm run server

# 終端 2：啟動前端開發伺服器
npm run dev
```

前端：http://localhost:5173  
後端 API：http://localhost:3001

## 📁 專案結構

```
order-management/
├── server/                 # 後端
│   ├── index.js           # Express 入口
│   ├── database.js        # SQLite 設定
│   └── routes/            # API 路由
│       ├── orders.js
│       ├── customers.js
│       ├── products.js
│       └── stats.js
├── src/                    # 前端
│   ├── components/        # React 組件
│   └── pages/             # 頁面
├── package.json
└── vite.config.js
```

## 📝 API 端點

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | /api/stats | 儀表板統計 |
| GET/POST | /api/orders | 訂單列表/新增 |
| PATCH | /api/orders/:id/status | 更新訂單狀態 |
| GET/POST | /api/customers | 客戶列表/新增 |
| GET/POST | /api/products | 產品列表/新增 |

## 📄 授權

MIT License
