require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const createError = require("http-errors");
const helmet = require("helmet");

const { rateLimit } = require("express-rate-limit");
const { xss } = require("express-xss-sanitizer");
const { Liquid } = require("liquidjs");

const app = express();

app.engine("liquid", new Liquid({
	root: __dirname,
	cache: process.env.NODE_ENV === "production",
	extname: ".liquid"
}).express());

app.set("trust proxy", 1);
app.set("view engine", "liquid");
app.set("views", [
	__dirname + "/views",
]);

app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(xss());
app.use(helmet());
app.use(rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 100,
	message: "You have exceeded the limit of 100 requests per 10 minutes."
}));
app.use((req, res, next) => {
	res.setHeader("x-powered-by", "Gabriel Aplok");
	next();
});

require("./routes")(app);

app.use((req, res, next) => {
	next(createError(404));
});

app.use((err, req, res, next) => {
	res.status(err.status || 500).render("404", {
		title: "404 Not Found",
		message: err.message,
		error: process.env.NODE_ENV === "development" ? err : null
	});
});

module.exports = app;