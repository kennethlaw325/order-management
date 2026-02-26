import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get all orders
router.get('/', (req, res) => {
    try {
        const { status } = req.query;
        let query = `
      SELECT o.*, c.name as customer_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
    `;

        if (status) {
            query += ` WHERE o.status = ?`;
        }
        query += ` ORDER BY o.created_at DESC`;

        const orders = status
            ? db.prepare(query).all(status)
            : db.prepare(query).all();

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single order with items
router.get('/:id', (req, res) => {
    try {
        const order = db.prepare(`
      SELECT o.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.id = ?
    `).get(req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const items = db.prepare(`
      SELECT oi.*, p.name as current_product_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(req.params.id);

        res.json({ ...order, items });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create order
router.post('/', (req, res) => {
    try {
        const { customer_id, items, notes } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Order must have at least one item' });
        }

        // Validate quantity is a positive integer
        for (const item of items) {
            if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
                return res.status(400).json({ error: `Invalid quantity for product_id ${item.product_id}: quantity must be a positive integer` });
            }
        }

        // Validate all products exist and have sufficient stock
        const insufficientStock = [];
        const productLookups = items.map(item => {
            const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id);
            if (!product) {
                throw new Error(`Product with id ${item.product_id} not found`);
            }
            if (product.stock < item.quantity) {
                insufficientStock.push({
                    product_id: product.id,
                    product_name: product.name,
                    requested: item.quantity,
                    available: product.stock
                });
            }
            return { product, quantity: item.quantity };
        });

        if (insufficientStock.length > 0) {
            return res.status(400).json({
                error: 'Insufficient stock for one or more products',
                insufficient_items: insufficientStock
            });
        }

        // Execute order creation in a transaction
        const createOrder = db.transaction(() => {
            // Calculate total
            let total = 0;
            const processedItems = productLookups.map(({ product, quantity }) => {
                const itemTotal = product.price * quantity;
                total += itemTotal;
                return {
                    product_id: product.id,
                    product_name: product.name,
                    quantity,
                    unit_price: product.price
                };
            });

            // Create order
            const orderResult = db.prepare(`
          INSERT INTO orders (customer_id, status, total, notes)
          VALUES (?, 'pending', ?, ?)
        `).run(customer_id || null, total, notes || null);

            const orderId = orderResult.lastInsertRowid;

            // Insert order items and update stock
            const insertItem = db.prepare(`
          INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
          VALUES (?, ?, ?, ?, ?)
        `);
            const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

            for (const item of processedItems) {
                insertItem.run(orderId, item.product_id, item.product_name, item.quantity, item.unit_price);
                updateStock.run(item.quantity, item.product_id);
            }

            return orderId;
        });

        const orderId = createOrder();

        const order = db.prepare(`
      SELECT o.*, c.name as customer_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.id = ?
    `).get(orderId);

        const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

        res.status(201).json({ ...order, items: orderItems });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update order status
router.patch('/:id/status', (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
        if (!existing) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // If cancelling, restore stock
        if (status === 'cancelled' && existing.status !== 'cancelled') {
            const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(req.params.id);
            for (const item of items) {
                if (item.product_id) {
                    db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(item.quantity, item.product_id);
                }
            }
        }

        db.prepare(`
      UPDATE orders 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, req.params.id);

        const order = db.prepare(`
      SELECT o.*, c.name as customer_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.id = ?
    `).get(req.params.id);

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete order
router.delete('/:id', (req, res) => {
    try {
        const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
        if (!existing) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Restore stock if order wasn't cancelled
        if (existing.status !== 'cancelled') {
            const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(req.params.id);
            for (const item of items) {
                if (item.product_id) {
                    db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(item.quantity, item.product_id);
                }
            }
        }

        db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
