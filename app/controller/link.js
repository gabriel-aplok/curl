const { customAlphabet } = require("nanoid");
const fs = require("fs");
const path = require("path");
const link = require("../models/link");

const ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const nanoidAlphanumeric = customAlphabet(ALPHANUMERIC, 7);

// Load profanity lists (en, pt-br)
const profanityFiles = [
  path.join(__dirname, "data", "en.txt"),
  path.join(__dirname, "data", "pt-br.txt"),
];
let profanityWords = [];
for (const file of profanityFiles) {
  try {
    const words = fs.readFileSync(file, "utf8")
      .split(/\r?\n/)
      .map(w => w.trim().toLowerCase())
      .filter(Boolean);
    profanityWords = profanityWords.concat(words);
  } catch (e) {
    // Ignore missing files
  }
}
const profanitySet = new Set(profanityWords);

/**
 * Checks if a string contains any profane word.
 * @param {string} str
 * @returns {boolean}
 */
const containsProfanity = (str) => {
  if (!str) return false;
  const lower = str.toLowerCase();
  for (const word of profanitySet) {
    if (word.length > 2 && lower.includes(word)) {
      return true;
    }
  }
  return false;
};

/**
 * Validates if a string is a well-formed URL.
 * @param {string} url - The URL to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
const isValidUrl = (url) => {
  const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
  return urlRegex.test(url);
};

/**
 * Creates a shortened link for a given original URL.
 * @param {string} originalUrl - The original URL to shorten.
 * @returns {Promise<object>} - Result object with success or error message.
 */
const createLink = async (originalUrl) => {
  try {
    // Validate input
    if (
      !originalUrl ||
      typeof originalUrl !== "string" ||
      originalUrl.trim() === ""
    ) {
      return { error: "Invalid URL" };
    }

    // Validate URL format
    if (!isValidUrl(originalUrl)) {
      return { error: "Invalid URL format" };
    }

    // Check if URL already exists
    const existingLink = await link.findOne({ where: { originalUrl } });
    if (existingLink) {
      return { error: "This URL has already been shortened" };
    }

    // Profanity validation
    if (containsProfanity(originalUrl)) {
      return { error: "URL contains inappropriate language" };
    }

    // Generate unique short code
    const shortCode = nanoidAlphanumeric();

    // Create new link entry
    const createdLink = await link.create({ originalUrl, shortCode });

    return { success: "URL shortened successfully!", data: createdLink };
  } catch (error) {
    console.error("Error creating link:", error);
    return { error: "Internal server error" };
  }
};

/**
 * Fetches a link by its short code and increments its click count.
 * @param {string} shortCode - The short code of the link.
 * @returns {Promise<object>} - Result object with link data or error.
 */
const fetchLink = async (shortCode) => {
  try {
    // Find link by short code
    const existingLink = await link.findOne({ where: { shortCode } });

    if (!existingLink) {
      return { error: "Link not found" };
    }

    // Increment click count
    existingLink.clicks++;
    await existingLink.save();

    return { data: existingLink };
  } catch (error) {
    console.error("Error fetching link:", error);
    return { error: "Internal server error" };
  }
};

/**
 * Gets the click count for a given short code.
 * @param {string} shortCode - The short code of the link.
 * @returns {Promise<object>} - Result object with click count or error.
 */
const getClicksCount = async (shortCode) => {
  try {
    // Find link by short code
    const existingLink = await link.findOne({ where: { shortCode } });

    if (!existingLink) {
      return { error: "Link not found" };
    }

    return { clicks: existingLink.clicks };
  } catch (error) {
    console.error("Error getting clicks count:", error);
    return { error: "Internal server error" };
  }
};

/**
 * Deletes all links from the database.
 * @returns {Promise<object>} - Result object with success or error message.
 */
const truncateLinks = async () => {
  try {
    await link.destroy({ where: {}, truncate: true });

    return { success: "All links truncated successfully!" };
  } catch (error) {
    console.error("Error truncating links:", error);
    return { error: "Internal server error" };
  }
};

module.exports = {
  createLink,
  fetchLink,
  getClicksCount,
  truncateLinks,
};
