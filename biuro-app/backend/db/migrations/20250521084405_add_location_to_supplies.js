exports.up = function(knex) {
  return knex.schema.alterTable('supplies', function(table) {
    table.string('location');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('supplies', function(table) {
    table.dropColumn('location');
  });
};
