const express = require("express");
const router = express.Router();
const link = require("../../controller/link");

router.get("/", async (req, res) => {
	res.render("index", {
		title: "cURL - Link Shortener"
	});
});

router.get("/home", async (req, res) => {
	res.render("home", {
		title: "Home",
		...req.body
	});
});

router.post("/home", async (req, res) => {
	try {
		const { originalUrl } = req.body;

		if (!originalUrl || typeof originalUrl !== "string" || originalUrl.trim() === "") {
			res.render("404", { message: "Invalid URL" });
		}

		const { data, error, success } = await link.createLink(originalUrl);

		res.render("home", {
			title: "Home",
			url: data ? `${process.env.URL}/${data.shortCode}` : undefined,
			success,
			error,
			...req.body
		});
	} catch (error) {
		console.error("Error creating link:", error);
		res.render("404", { message: "Internal server error" });
	}
});

router.all("/home/truncate", async (req, res) => {
	try {
		if (process.env.NODE_ENV !== "development") {
			return res.render("404", { message: "You are not in development mode." });
		}

		await link.truncateLinks();
		res.render("home", {
			title: "Home",
			truncate: true,
			success: "All links have been truncated.",
			...req.body
		});
	} catch (error) {
		console.error("Error truncating links:", error);
		res.render("404", { message: "Internal server error" });
	}
});

router.get("/:shortCode", async (req, res) => {
	try {
		const { shortCode } = req.params;
		const { data, error } = await link.fetchLink(shortCode);

		if (data) {
			res.redirect(data.originalUrl);
		} else {
			res.render("404", {
				title: "Link Not Found",
				message: error
			});
		}
	} catch (error) {
		console.error("Error fetching link:", error);
		res.render("404", { message: "Internal server error" });
	}
});

router.get("/:shortCode/clicks", async (req, res) => {
	try {
		const { shortCode } = req.params;
		const { clicks, error } = await link.getClicksCount(shortCode);

		if (error) {
			return res.render("404", { message: error });
		}

		res.send({ clicks });
	} catch (error) {
		console.error("Error getting clicks count:", error);
		res.render("404", { message: "Internal server error" });
	}
});

module.exports = router;