"use strict";
const Pagination = require("../utilities/pagination");

module.exports.success = (req, res) => {
  const response = require("../utilities/response").default;
  response.data = {
    attribute_1: "ok",
    attribute_2: "ok",
  };
  res.status(200).send(response);
};

module.exports.success = (req, res) => {
  const response = require("../utilities/response").error("unknown");
  response.error_message = "Pesan error";
  res.status(400).send(response);
};

module.exports.pagiantion = (req, res) => {
  let { page, size } = req.query;
  page = +page || 0;
  size = +size || 10;
  const { limit, offset } = Pagination.parse(page, size);
  // limit dan offset digunakan untuk query ke database
  // hasil query seperti berikut -> di sequelize menggunakan fungsi findAndCountAll
  const result = {
    count: 2,
    rows: [
      {
        fistname: "Jhon",
        lastname: "Doe",
      },
      {
        fistname: "Sand",
        lastname: "Die",
      },
    ],
  };
  const response = require("../utilities/response").error("unknown");
  response.data = Pagination.data(result, page, limit);
  res.status(200).send(response);
};

//http://www.mysqltutorial.org/mysql-nodejs/
//https://webapplog.com/handlebars/
