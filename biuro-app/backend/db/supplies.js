const knex = require('knex')(require('../knexfile').development);

async function getAll({ category, sortBy = 'id', order = 'asc' }) {
  const validSortColumns = ['id', 'name', 'category', 'quantity', 'location'];
  const validOrders = ['asc', 'desc'];

  if (!validSortColumns.includes(sortBy)) throw new Error('Invalid sort column');
  if (!validOrders.includes(order.toLowerCase())) throw new Error('Invalid sort order');

  let query = knex('supplies').select('*');
  if (category) query.where('category', category);
  query.orderBy(sortBy, order);

  return await query;
}

async function getById(id) {
  return await knex('supplies').where({ id }).first();
}

async function create(data) {
  return await knex('supplies').insert(data).returning('*');
}

async function update(id, data) {
  return await knex('supplies').where({ id }).update(data).returning('*');
}

async function deleteItem(id) {
  return await knex('supplies').where({ id }).del();
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteItem,
};
