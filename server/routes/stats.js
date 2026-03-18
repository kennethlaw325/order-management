import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get dashboard statistics
router.get('/', (req, res) => {
    try {
        // Order counts by status
        const orderStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM orders
    `).get();

        // Total revenue (completed orders only)
        const revenue = db.prepare(`
      SELECT COALESCE(SUM(total), 0) as total_revenue
      FROM orders
      WHERE status = 'completed'
    `).get();

        // Customer count
        const customerCount = db.prepare('SELECT COUNT(*) as count FROM customers').get();

        // Product count & low stock count
        const productStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN stock < 10 THEN 1 ELSE 0 END) as low_stock
      FROM products
    `).get();

        // Recent orders
        const recentOrders = db.prepare(`
      SELECT o.*, c.name as customer_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `).all();

        // Sales by day (last 7 days)
        const salesByDay = db.prepare(`
      SELECT 
        date(created_at) as date,
        COUNT(*) as order_count,
        SUM(total) as revenue
      FROM orders
      WHERE created_at >= date('now', '-7 days')
        AND status != 'cancelled'
      GROUP BY date(created_at)
      ORDER BY date ASC
    `).all();

        const thisWeek = db.prepare(`
            SELECT COUNT(*) as orders, COALESCE(SUM(total), 0) as revenue
            FROM orders WHERE created_at >= date('now', '-7 days') AND status != 'cancelled'
        `).get();

        const lastWeek = db.prepare(`
            SELECT COUNT(*) as orders, COALESCE(SUM(total), 0) as revenue
            FROM orders WHERE created_at >= date('now', '-14 days')
              AND created_at < date('now', '-7 days') AND status != 'cancelled'
        `).get();

        const thisWeekCustomers = db.prepare(`
            SELECT COUNT(*) as count FROM customers WHERE created_at >= date('now', '-7 days')
        `).get();

        const lastWeekCustomers = db.prepare(`
            SELECT COUNT(*) as count FROM customers
            WHERE created_at >= date('now', '-14 days') AND created_at < date('now', '-7 days')
        `).get();

        const calcTrend = (curr, prev) => {
            if (!prev || prev === 0) return null;
            return ((curr - prev) / prev * 100).toFixed(1);
        };

        const trends = {
            orders: calcTrend(thisWeek.orders, lastWeek.orders),
            revenue: calcTrend(thisWeek.revenue, lastWeek.revenue),
            customers: calcTrend(thisWeekCustomers.count, lastWeekCustomers.count),
        };

        res.json({
            orders: orderStats,
            revenue: revenue.total_revenue,
            customers: customerCount.count,
            products: productStats,
            recentOrders,
            salesByDay,
            trends
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
