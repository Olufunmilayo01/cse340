/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities/index");
const pool = require("./database/");

const app = express();
const static = require("./routes/static");

/* ***********************
 *View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root
/* ***********************
 * Routes
 *************************/
app.use(static);
// Index route
app.get("/", baseController.buildHome);
// Inventory routes
app.use("/inv", inventoryRoute);
/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

// 404 Not Found Handler
app.use(async (req, res, next) => {
  const nav = await utilities.getNav();
  res.status(404).render("errors/error", {
    title: "404 Not Found",
    message: "The page you requested could not be found.",
    nav,
  });
});

//Error handler
app.use(async (err, req, res, next) => {
  console.error("ERROR:", err);

  let nav = await utilities.getNav();

  res.status(err.status || 500);
  res.render("errors/error", {
    title: "Server Error",
    message: err.message || "An unexpected error occurred.",
    nav,
  });
});

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
