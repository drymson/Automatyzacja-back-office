const express = require('express');
const router = express.Router();
const tasks = require('../db/tasks');

router.get('/', async (req, res) => {
  try {
    const data = await tasks.getAll();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await tasks.getById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, status, created_at } = req.body;
    if (!title || !status || (status !== 'pending' && status !== 'done')) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const newItem = await tasks.create({ title, description, status, created_at });
    res.status(201).json(newItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, created_at } = req.body;
    if (!title || !status || (status !== 'pending' && status !== 'done')) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const updated = await tasks.update(req.params.id, { title, description, status, created_at });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await tasks.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
