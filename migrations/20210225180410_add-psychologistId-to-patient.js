/* eslint-disable func-names */

const dbPatient = require('../db/patients');

exports.up = function (knex) {
  return knex.schema.table(dbPatient.patientsTable, (table) => {
    table.uuid('psychologistId').notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.table(dbPatient.patientsTable, (table) => {
    table.dropColumn('psychologistId');
  });
};
