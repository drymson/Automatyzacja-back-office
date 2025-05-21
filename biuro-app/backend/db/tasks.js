const knex = require('./knex');

async function getAll() {
  return await knex('tasks').select('*');
}

async function getById(id) {
  const item = await knex('tasks').where({ id }).first();
  return item;
}

async function create(data) {
  const [newItem] = await knex('tasks').insert(data).returning('*');
  return newItem;
}

async function update(id, data) {
  const [updatedItem] = await knex('tasks')
    .where({ id })
    .update(data)
    .returning('*');
  return updatedItem;
}

async function deleteById(id) {
  return await knex('tasks').where({ id }).del();
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteById,
};
