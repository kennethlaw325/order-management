import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get all products
router.get('/', (req, res) => {
    try {
        const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single product
router.get('/:id', (req, res) => {
    try {
        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create product
router.post('/', (req, res) => {
    try {
        const { name, description, price, stock } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const result = db.prepare(`
      INSERT INTO products (name, description, price, stock)
      VALUES (?, ?, ?, ?)
    `).run(name, description || null, price || 0, stock || 0);

        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update product
router.put('/:id', (req, res) => {
    try {
        const { name, description, price, stock } = req.body;

        const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
        if (!existing) {
            return res.status(404).json({ error: 'Product not found' });
        }

        db.prepare(`
      UPDATE products 
      SET name = ?, description = ?, price = ?, stock = ?
      WHERE id = ?
    `).run(
            name || existing.name,
            description !== undefined ? description : existing.description,
            price !== undefined ? price : existing.price,
            stock !== undefined ? stock : existing.stock,
            req.params.id
        );

        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete product
router.delete('/:id', (req, res) => {
    try {
        const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
        if (!existing) {
            return res.status(404).json({ error: 'Product not found' });
        }

        db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
