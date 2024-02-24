require("dotenv").config();

const Sequelize = require("sequelize");
const sequelize = new Sequelize(`postgres://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}?sslmode=require`, {
	dialect: process.env.PG_DIALECT,
	logging: false,
	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000
	}
});

module.exports = sequelize;

(async () => {
	await sequelize.authenticate().then(() => console.log("Database connection authenticated!")).catch((e) => console.log(`Unable to authenticate to database: ${e}!`));
})();

module.exports = sequelize;