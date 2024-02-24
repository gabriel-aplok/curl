const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const link = sequelize.define("link", {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	originalUrl: {
		type: DataTypes.STRING,
		allowNull: false
	},
	shortCode: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true
	},
	clicks: {
		type: DataTypes.INTEGER,
		defaultValue: 0
	}
});

module.exports = link;