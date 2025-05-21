exports.up = function(knex) {
  return knex.schema.alterTable('office_resources', function(table) {
    table.string('type'); // dodaj kolumnę 'type'
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('office_resources', function(table) {
    table.dropColumn('type'); // usuń kolumnę w rollbacku
  });
};
