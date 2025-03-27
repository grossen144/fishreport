import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("fishing_reports", (table) => {
    table.increments("id").primary();
    table
      .integer("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("species").notNullable();
    table.date("date").notNullable();
    table.string("location").notNullable();
    table.decimal("hours_fished", 4, 1).notNullable();
    table.integer("number_of_persons").notNullable();
    table.integer("number_of_fish").notNullable();
    table.integer("fish_over_40cm");
    table.integer("bonus_pike");
    table.integer("bonus_zander");
    table.decimal("latitude", 10, 8);
    table.decimal("longitude", 10, 8);
    table.decimal("water_temperature", 4, 1);
    table.decimal("bag_total", 5, 2);
    table.text("comment");
    table.decimal("air_temperature", 4, 1);
    table.decimal("wind_speed", 4, 1);
    table.string("wind_direction");
    table.string("weather_condition");
    table.string("lunar_phase");
    table.jsonb("weather_data");
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();

    // Create indexes for common queries
    table.index("user_id");
    table.index("date");
    table.index("species");
    table.index("location");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("fishing_reports");
}
