exports.up = async function(knex) {
  await knex.schema.alterTable('tickets', table => {
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('tickets', table => {
    table.dropColumn('user_id');
  });
};
