const knex = require('./knex');

async function getAll() {
  return await knex('tickets')
    .select('tickets.*', 'users.username')
    .leftJoin('users', 'tickets.user_id', 'users.id');
}

async function getById(id) {
  return await knex('tickets').where({ id }).first();
}

async function create(data) {
  if (!data.created_at) {
    data.created_at = new Date();
  }
  const [newTicket] = await knex('tickets').insert(data).returning('*');
  return newTicket;
}

async function update(id, data) {
  data.updated_at = new Date();
  const [updatedTicket] = await knex('tickets')
    .where({ id })
    .update(data)
    .returning('*');
  return updatedTicket;
}

async function deleteById(id) {
  return await knex('tickets').where({ id }).del();
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteById,
};
