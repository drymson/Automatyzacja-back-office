const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../db/knexfile').development);

router.get('/', async (req, res) => {
  try {
    const assets = await knex('office_assets').select('*');
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { name, type, quantity, location } = req.body;
  try {
    const [newAsset] = await knex('office_assets')
      .insert({ name, type, quantity, location })
      .returning('*');
    res.status(201).json(newAsset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
