// Load environment variables from .env file
require("dotenv").config();

// Import Sequelize ORM
const Sequelize = require("sequelize");

// Define database configuration using environment variables
const config = {
  username: process.env.DB_USER, // Database username
  password: process.env.DB_PASSWORD, // Database password
  database: process.env.DB_DATABASE, // Database name
  host: process.env.DB_HOST, // Database host
  port: process.env.DB_PORT, // Database port
  dialect: process.env.DB_DIALECT || "mysql", // Database dialect (default: mysql)
  logging: false, // Disable SQL query logging
  pool: {
    max: 5, // Maximum number of connections in pool
    min: 0, // Minimum number of connections in pool
    acquire: 30000, // Maximum time (ms) to try getting connection before throwing error
    idle: 10000, // Maximum time (ms) a connection can be idle before being released
  },
  dialectOptions: {}, // Additional options for the database dialect
};

// Optional: Add SSL options for MySQL if enabled in environment variables
if (process.env.DB_DIALECT === "mysql" && process.env.DB_SSL === "true") {
  config.dialectOptions.ssl = { rejectUnauthorized: false };
}

// Optional: Add SSL options for Postgres if enabled in environment variables
if (process.env.DB_DIALECT === "postgres" && process.env.DB_SSL === "true") {
  config.dialectOptions.ssl = { require: true, rejectUnauthorized: false };
}

// Create Sequelize instance with the configuration
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// Immediately-invoked async function to test database connection
(async () => {
  try {
    await sequelize.authenticate(); // Try to authenticate the connection
    console.log("Database connection authenticated!");
  } catch (e) {
    console.log(`Unable to authenticate to database: ${e}!`);
  }
})();

// Export the Sequelize instance for use in other files
module.exports = sequelize;
