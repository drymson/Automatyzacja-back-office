const knex = require('./knex');

async function getAll() {
  return await knex('office_resources').select('*');
}

async function getById(id) {
  const item = await knex('office_resources').where({ id }).first();
  return item;
}

async function create(data) {
  const [newItem] = await knex('office_resources').insert(data).returning('*');
  return newItem;
}

async function update(id, data) {
  const [updatedItem] = await knex('office_resources')
    .where({ id })
    .update(data)
    .returning('*');
  return updatedItem;
}

async function deleteById(id) {
  return await knex('office_resources').where({ id }).del();
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteById,
};
