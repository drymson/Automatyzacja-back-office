exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.string('username').unique();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.dropColumn('username');
  });
};
