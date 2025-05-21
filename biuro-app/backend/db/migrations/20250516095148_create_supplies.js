exports.up = function(knex) {
  return knex.schema.createTable('supplies', table => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.integer('quantity').notNullable().defaultTo(0);
    table.string('category'); // kawa, herbata, chemia itd.
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('supplies');
};
