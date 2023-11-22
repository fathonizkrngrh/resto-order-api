"use strict";

//CONTROLLERS
const controller = require("../controllers");

//ROUTINGS
module.exports = (app) => {
  app.get("/", (req, res) => controller.default(req, res));
  // app.post("/create-user", (req, res) => userC.createUser(req, res));
};
