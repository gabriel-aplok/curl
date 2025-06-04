const { nanoid } = require("nanoid");
const link = require("../models/link");

const isValidUrl = (url) => {
  const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
  return urlRegex.test(url);
};

const createLink = async (originalUrl) => {
  try {
    if (
      !originalUrl ||
      typeof originalUrl !== "string" ||
      originalUrl.trim() === ""
    ) {
      return { error: "Invalid URL" };
    }

    if (!isValidUrl(originalUrl)) {
      return { error: "Invalid URL format" };
    }

    const existingLink = await link.findOne({ where: { originalUrl } });
    if (existingLink) {
      return { error: "This URL has already been shortened" };
    }

    const shortCode = nanoid(7);

    const createdLink = await link.create({ originalUrl, shortCode });

    return { success: "URL shortened successfully!", data: createdLink };
  } catch (error) {
    console.error("Error creating link:", error);
    return { error: "Internal server error" };
  }
};

const fetchLink = async (shortCode) => {
  try {
    const existingLink = await link.findOne({ where: { shortCode } });

    if (!existingLink) {
      return { error: "Link not found" };
    }

    existingLink.clicks++;
    await existingLink.save();

    return { data: existingLink };
  } catch (error) {
    console.error("Error fetching link:", error);
    return { error: "Internal server error" };
  }
};

getClicksCount = async (shortCode) => {
  try {
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
