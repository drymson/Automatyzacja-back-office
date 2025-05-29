const express = require('express');
const router = express.Router();
const tickets = require('../db/tickets');

router.get('/', async (req, res) => {
  try {
    const data = await tickets.getAll();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await tickets.getById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  console.log('POST /api/tickets body:', req.body);
  try {
    const { subject, description, status, priority, created_at, user_id } = req.body;

    if (!subject || typeof subject !== 'string') {
      return res.status(400).json({ error: 'Subject is required and must be a string' });
    }

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const newItem = await tickets.create({
      subject,
      description,
      status,
      priority,
      created_at: created_at ? new Date(created_at) : new Date(),
      user_id,
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await tickets.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await tickets.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
