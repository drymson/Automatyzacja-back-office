const express = require('express');
const router = express.Router();
const supplies = require('../db/supplies');

router.get('/', async (req, res) => {
  try {
    const data = await supplies.getAll(req.query);
    res.json(data);
  } catch (error) {
    console.error('GET /api/supplies error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await supplies.getById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    console.error(`GET /api/supplies/${req.params.id} error:`, error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const [newItem] = await supplies.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('POST /api/supplies error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [updated] = await supplies.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (error) {
    console.error(`PUT /api/supplies/${req.params.id} error:`, error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await supplies.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (error) {
    console.error(`DELETE /api/supplies/${req.params.id} error:`, error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
