const database = require("../config/database");
const link = require("../controller/link");

(async () => {
	await database.sync().then(() => console.log("Database synchronized!")).catch((e) => console.log(`Unable to sync to database: ${e}!`));
})();

module.exports = async(app) => {
	app.use("/", require("./pages/index"));
};