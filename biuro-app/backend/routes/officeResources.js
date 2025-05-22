const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../db/knexfile').development);

router.get('/alerts', async (req, res) => {
  try {
    const lowStockItems = await knex('office_resources').where('quantity', '<', 3);
    res.json(lowStockItems);
  } catch (error) {
    res.status(500).json({ error: 'Błąd pobierania alertów' });
  }
});

router.get('/', async (req, res) => {
  const { type, sortBy = 'id', order = 'asc' } = req.query;

  const validSortColumns = ['id', 'name', 'type', 'quantity', 'location'];
  const validOrders = ['asc', 'desc'];

  if (!validSortColumns.includes(sortBy)) return res.status(400).json({ error: 'Invalid sort column' });
  if (!validOrders.includes(order.toLowerCase())) return res.status(400).json({ error: 'Invalid order' });

  try {
    let query = knex('office_resources').select('*');

    if (type) query.where('type', type);

    query.orderBy(sortBy, order);

    const results = await query;
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { name, type, quantity, location } = req.body;

  if (
    !name || typeof name !== 'string' ||
    !type || typeof type !== 'string' ||
    typeof quantity !== 'number' || quantity < 0 ||
    (location && typeof location !== 'string')
  ) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const [newItem] = await knex('office_resources')
      .insert({ name, type, quantity, location })
      .returning('*');
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { name, type, quantity, location } = req.body;

  if (
    !name || typeof name !== 'string' ||
    !type || typeof type !== 'string' ||
    typeof quantity !== 'number' || quantity < 0 ||
    (location && typeof location !== 'string')
  ) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const [updated] = await knex('office_resources')
      .where({ id: req.params.id })
      .update({ name, type, quantity, location })
      .returning('*');

    if (!updated) return res.status(404).json({ error: 'Resource not found' });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await knex('office_resources').where({ id: req.params.id }).del();
    if (!deleted) return res.status(404).json({ error: 'Resource not found' });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
