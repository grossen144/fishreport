const { Knex } = require("knex");

exports.up = async function (knex) {
  await knex.schema.createTable("fishing_reports", (table) => {
    table.increments("id").primary();
    table.integer("user_id").notNullable().references("id").inTable("users");
    table.string("species").notNullable();
    table.date("date").notNullable();
    table.string("location").notNullable();
    table.decimal("hours_fished", 4, 1).notNullable();
    table.integer("number_of_persons").notNullable();
    table.integer("number_of_fish").notNullable();
    table.integer("fish_over_40cm").nullable();
    table.integer("bonus_pike").nullable();
    table.integer("bonus_zander").nullable();
    table.decimal("water_temperature", 4, 1).nullable();
    table.decimal("bag_total", 6, 2).nullable();
    table.text("comment").nullable();
    table.decimal("latitude", 10, 8).nullable();
    table.decimal("longitude", 11, 8).nullable();
    table.jsonb("weather_data").nullable();
    table.jsonb("lunar_phase").nullable();
    table.timestamps(true, true);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("fishing_reports");
};
