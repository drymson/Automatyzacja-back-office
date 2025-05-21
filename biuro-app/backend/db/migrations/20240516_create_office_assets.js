exports.up = function(knex) {
  return knex.schema.createTable('office_assets', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('type').notNullable();
    table.integer('quantity').notNullable().defaultTo(1);
    table.string('location').nullable();
    table.timestamp('date_added').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('office_assets');
};
