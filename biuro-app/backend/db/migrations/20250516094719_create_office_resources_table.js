/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('office_resources', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.integer('quantity').notNullable().defaultTo(0);
    table.text('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('office_resources');
};
