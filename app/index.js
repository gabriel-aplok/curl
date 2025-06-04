// Load environment variables from .env file
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

// Set up Liquid template engine
app.engine(
  "liquid",
  new Liquid({
    root: __dirname,
    cache: process.env.NODE_ENV === "production",
    extname: ".liquid",
  }).express(),
);
app.set("view engine", "liquid");
app.set("views", [__dirname + "/views"]);

// Trust proxy headers (for rate limiting, etc.)
app.set("trust proxy", 1);

// Serve static files from /public
app.use(express.static(__dirname + "/public"));

// Parse incoming JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Parse request bodies (redundant with express.json/urlencoded, but kept for legacy support)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Enable CORS for all routes
app.use(cors());

// Sanitize user input to prevent XSS attacks
app.use(xss());

// Secure HTTP headers with Helmet
app.use(helmet());

// Add Content Security Policy (CSP) header
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://cdn.jsdelivr.net",
        "https://use.fontawesome.com",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdn.jsdelivr.net",
        "https://use.fontawesome.com",
      ],
      fontSrc: [
        "'self'",
        "https://cdn.jsdelivr.net",
        "https://use.fontawesome.com",
      ],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

// Enforce HTTPS in production
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect("https://" + req.headers.host + req.url);
    }
    next();
  });
}

// Rate limiting: max 100 requests per 15 minutes per IP
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: "You have exceeded the limit of 100 requests per 10 minutes.",
  }),
);

// Custom headers for branding
app.use((_req, res, next) => {
  res.setHeader("x-powered-by", "Gabriel Aplok");
  res.setHeader("x-render-origin-server", "FireWave Interactive");
  next();
});

// Register application routes
require("./routes")(app);

// Handle 404 errors (route not found)
app.use((_req, _res, next) => {
  next(createError(404));
});

// Error handler middleware
app.use((err, _req, res, _next) => {
  res.status(err.status || 500).render("404", {
    title: "404 Not Found",
    message: err.message,
    error: process.env.NODE_ENV === "development" ? err : null,
  });
});

module.exports = app;
