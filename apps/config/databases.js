"use strict"
require('dotenv').config()

module.exports = {
    resto_order: {
        "url": process.env.DB_URL || '',
        "username": process.env.DB_USERNAME || 'root',
        "password": process.env.DB_PASSWORD || '',
        "host": process.env.DB_HOST || '127.0.0.1',
        "database": process.env.DB_NAME || "resto-order",
        "port": process.env.DB_PORT || 3306,
        "ssl": process.env.DB_SSL ||false,
        "dialect": "mysql",
        "dialectOptions": {},
        "timezone": "Asia/Jakarta"
    },
    // redis: {
    //     host: process.env.REDIS_HOST || '127.0.0.1',
    //     port: process.env.REDIS_PORT || '6379',
    //     username: process.env.REDIS_USERNAME || '',
    //     password: process.env.REDIS_PASSWORD || '',
    // }
    // other database configuration here 
}