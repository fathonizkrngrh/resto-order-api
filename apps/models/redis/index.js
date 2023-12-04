"use strict"
const CONFIG = require("../../config")

const rPort   = CONFIG.redist_port
const rHost   = CONFIG.redist_host
const rUrl   = CONFIG.redist_url
const redis   = require('redis')
const chalk   = require('chalk')
const client  = rUrl ? redis.createClient(rUrl) : redis.createClient(rPort, rHost)
client.on('connect', () => { console.log(chalk.green('** Redis client connected on 6379 **')) })
client.on('error',  err => { console.log(chalk.green(`** Something went wrong: ${err}`)) })

module.exports = client
