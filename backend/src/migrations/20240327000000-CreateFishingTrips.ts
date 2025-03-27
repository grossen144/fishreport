const { Knex } = require("knex");

exports.up = async function (knex) {
  await knex.schema.createTable("fishing_trips", (table) => {
    table.increments("id").primary();
    table.integer("user_id").notNullable().references("id").inTable("users");
    table.string("name").notNullable();
    table.date("date").notNullable();
    table.decimal("water_temperature", 4, 1).nullable();
    table.decimal("hours_fishing", 4, 1).nullable();
    table.integer("number_of_persons").nullable();
    table.integer("total_fish").nullable();
    table.decimal("bag_total", 6, 2).nullable();
    table.integer("bonus_zander").nullable();
    table.integer("fish_over_40").nullable();
    table.text("comment").nullable();
    table.jsonb("weather_data").nullable();
    table.jsonb("lunar_phase").nullable();
    table.string("target_species").notNullable().defaultTo("perch");
    table.timestamps(true, true);
  });

  await knex.schema.createTable("catches", (table) => {
    table.increments("id").primary();
    table
      .integer("trip_id")
      .notNullable()
      .references("id")
      .inTable("fishing_trips")
      .onDelete("CASCADE");
    table.string("species").notNullable();
    table.decimal("weight_grams").notNullable();
    table.decimal("length_cm").notNullable();
    table.decimal("latitude", 10, 8).nullable();
    table.decimal("longitude", 11, 8).nullable();
    table.timestamp("caught_at").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("catches");
  await knex.schema.dropTableIfExists("fishing_trips");
};
