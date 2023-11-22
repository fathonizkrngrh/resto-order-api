"use strict"
const env          = process.env.ENV || "development"
const access_token = process.env.ACCESS_TOKEN || "5!eST@5eCuRE4u7h3Nt1c@T!0N53t0k3n2020!"

const path      = require("path")
const setting   = require(path.join(__dirname, '..', '/models/mysql/credentials', 'apps.json'))[env]
const Sequelize = require('sequelize')
const sequelize = new Sequelize(setting.database, setting.username, setting.password, setting)
const Op        = Sequelize.Op
const mApps     = require('../models/mysql/apps')

module.exports.isAuthenticated = (req, res, next) => { }
