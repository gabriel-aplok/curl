// Import the database configuration
const database = require("../config/database");

// Immediately Invoked Async Function Expression (IIFE) to sync the database
(async () => {
  try {
    await database.sync();
    console.log("Database synchronized!");
  } catch (e) {
    console.log(`Unable to sync to database: ${e}!`);
  }
})();

/**
 * Registers route handlers with the Express app.
 * @param {import('express').Express} app - The Express application instance.
 */
module.exports = async (app) => {
  // Mount the index page routes at the root path
  app.use("/", require("./pages/index"));
};
