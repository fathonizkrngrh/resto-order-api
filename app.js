"use strict";
const config = require("./apps/config");
// EXPRESS
const express = require("express");
const app = express();

// LOGGER FOR DEV
const logger = require("morgan");
if (config.env === "development") {
  app.use(logger("dev"));
}

// I/O
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser(config.secret_key_encrypt));

// MODELS
app.models = {};
app.models.mysql = require("./apps/models/mysql");
// app.models.buffer    = require('./app/models/redis')
// CONTROLLERS ROUTE
app.routes = require("./apps/routes")(app);

module.exports = app;
