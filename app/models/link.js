// Import Sequelize DataTypes and the sequelize instance
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Define the Link model with fields and constraints
const Link = sequelize.define("Link", {
  // Primary key: auto-incrementing integer ID
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // The original (long) URL, required
  originalUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isUrl: true, // Ensure the value is a valid URL
      notEmpty: true,
    },
  },
  // The unique short code for the URL, required
  shortCode: {
    type: DataTypes.STRING(16), // Limit length for efficiency
    allowNull: false,
    unique: true,
    validate: {
      isAlphanumeric: true, // Only allow alphanumeric codes
      notEmpty: true,
      len: [4, 16], // Enforce length between 4 and 16
    },
  },
  // Number of times the short link has been clicked
  clicks: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: 0, // Clicks can't be negative
    },
  },
}, {
  tableName: "links", // Explicit table name
  timestamps: true,   // Adds createdAt and updatedAt fields
  underscored: true,  // Use snake_case for DB columns
});

// Export the Link model for use in other files
module.exports = Link;
