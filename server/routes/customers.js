import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get all customers
router.get('/', (req, res) => {
    try {
        const customers = db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM orders WHERE customer_id = c.id) as order_count
      FROM customers c
      ORDER BY c.created_at DESC
    `).all();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single customer
router.get('/:id', (req, res) => {
    try {
        const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Get customer's orders
        const orders = db.prepare(`
      SELECT * FROM orders 
      WHERE customer_id = ? 
      ORDER BY created_at DESC
    `).all(req.params.id);

        res.json({ ...customer, orders });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create customer
router.post('/', (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const result = db.prepare(`
      INSERT INTO customers (name, email, phone, address)
      VALUES (?, ?, ?, ?)
    `).run(name, email || null, phone || null, address || null);

        const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update customer
router.put('/:id', (req, res) => {
    try {
        const { name, email, phone, address } = req.body;

        const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
        if (!existing) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        db.prepare(`
      UPDATE customers 
      SET name = ?, email = ?, phone = ?, address = ?
      WHERE id = ?
    `).run(
            name || existing.name,
            email !== undefined ? email : existing.email,
            phone !== undefined ? phone : existing.phone,
            address !== undefined ? address : existing.address,
            req.params.id
        );

        const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete customer
router.delete('/:id', (req, res) => {
    try {
        const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
        if (!existing) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
