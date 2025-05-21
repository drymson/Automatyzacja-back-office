exports.up = function (knex) {
  return knex.schema.alterTable('office_resources', function (table) {
    table.string('location'); // dodajemy kolumnę location
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('office_resources', function (table) {
    table.dropColumn('location');
  });
};
