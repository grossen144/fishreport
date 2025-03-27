import knex from "knex";
import { Knex } from "knex";

const config: Knex.Config = {
  client: "pg",
  connection: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "fishreport",
  },
  migrations: {
    directory: "./src/migrations",
    extension: "ts",
  },
  pool: {
    min: 2,
    max: 10,
  },
};

export default knex(config);
