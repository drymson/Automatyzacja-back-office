exports.up = function(knex) {
  return knex.schema.createTable('tickets', function(table) {
    table.increments('id').primary();
    table.string('subject').notNullable();  
    table.text('description');
    table.string('priority').notNullable().defaultTo('low');  
    table.string('status').notNullable().defaultTo('open'); 
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('tickets');
};
