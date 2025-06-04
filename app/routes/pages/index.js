const express = require("express");
const router = express.Router();
const link = require("../../controller/link");

// Render the index page
router.get("/", async (_req, res) => {
  res.render("index", {
    title: "cURL - Link Shortener",
  });
});

// Render the home page (GET)
router.get("/home", async (req, res) => {
  res.render("home", {
    title: "Home",
    ...req.query, // Use query params for GET requests
  });
});

// Handle link creation (POST)
router.post("/home", async (req, res) => {
  try {
    const { originalUrl } = req.body;

    // Validate the original URL
    if (
      !originalUrl ||
      typeof originalUrl !== "string" ||
      originalUrl.trim() === ""
    ) {
      return res.status(400).render("404", { message: "Invalid URL" });
    }

    // Attempt to create a new short link
    const { data, error, success } = await link.createLink(originalUrl);

    res.render("home", {
      title: "Home",
      url: data ? `${process.env.URL}/${data.shortCode}` : undefined,
      success,
      error,
      ...req.body,
    });
  } catch (error) {
    console.error("Error creating link:", error);
    res.status(500).render("404", { message: "Internal server error" });
  }
});

// Truncate all links (development only)
router.all("/home/truncate", async (req, res) => {
  try {
    if (process.env.NODE_ENV !== "development") {
      return res.status(403).render("404", { message: "You are not in development mode." });
    }

    await link.truncateLinks();
    res.render("home", {
      title: "Home",
      truncate: true,
      success: "All links have been truncated.",
      ...req.body,
    });
  } catch (error) {
    console.error("Error truncating links:", error);
    res.status(500).render("404", { message: "Internal server error" });
  }
});

// Redirect to the original URL using the short code
router.get("/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;
    const { data, error } = await link.fetchLink(shortCode);

    if (data) {
      return res.redirect(data.originalUrl);
    }

    res.status(404).render("404", {
      title: "Link Not Found",
      message: error,
    });
  } catch (error) {
    console.error("Error fetching link:", error);
    res.status(500).render("404", { message: "Internal server error" });
  }
});

// Get the number of clicks for a short code
router.get("/:shortCode/clicks", async (req, res) => {
  try {
    const { shortCode } = req.params;
    const { clicks, error } = await link.getClicksCount(shortCode);

    if (error) {
      return res.status(404).render("404", { message: error });
    }

    res.json({ clicks });
  } catch (error) {
    console.error("Error getting clicks count:", error);
    res.status(500).render("404", { message: "Internal server error" });
  }
});

module.exports = router;
