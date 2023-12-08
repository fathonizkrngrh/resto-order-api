"use strict"
require('dotenv').config()

const CONFIG        = {}
CONFIG.env          = process.env.ENV           || 'development'
CONFIG.port         = process.env.PORT          || '8088'
CONFIG.url          = process.env.URL           || 'http://localhost:' + CONFIG.port
CONFIG.app          = process.env.APP           || 'nodejs-restful-api'
CONFIG.app_version  = process.env.APP_VERSION   || '1'
CONFIG.app_semantic = process.env.APP_SEMANTIC  || '0.1.0'
CONFIG.db_type      = process.env.DB_TYPE       || 'sql' //nosql
CONFIG.db_dialect   = process.env.DB_DIALECT    || 'mysql' //mongodb
CONFIG.db_server    = process.env.DB_SERVER     || '127.0.0.1' //clusterexperiment-bqz4k.mongodb.net
CONFIG.db_port      = process.env.DB_PORT       || '3306' //27017
CONFIG.db_name      = process.env.DB_NAME       || 'resto-order' //admin
CONFIG.cloudinary_api_key      = process.env.CLOUDINARY_API_KEY       || '825989214586882'
CONFIG.cloudinary_api_secret      = process.env.CLOUDINARY_API_SECRET       || 'bPnfrGjkayfgnrAIDUmGqbcThHs'
CONFIG.cloudinary_cloud_name      = process.env.CLOUDINARY_CLOUD_NAME       || 'dlwncfs2u'

CONFIG.jwt_encryption  = process.env.JWT_ENCRYPTION || 'R4h451a13An9Et'
CONFIG.jwt_expiration  = process.env.JWT_EXPIRATION || '10000'

CONFIG.redist_host    = process.env.REDIS_HOST     || '127.0.0.1'
CONFIG.redist_port    = process.env.REDIS_PORT     || '6379' 
CONFIG.redist_url     = process.env.REDIS_URL     || '' 

CONFIG.google_client_id     = process.env.GOOGLE_CLIENT_ID     || ''
CONFIG.google_client_secret = process.env.GOOGLE_CLIENT_SECRET     || '' 
CONFIG.google_redirect_uri  = process.env.GOOGLE_REDIRECT_URI     || '' 

CONFIG.password_key_encrypt = process.env.SECRET_KEY_ENCRYPTION || 'R4h451a13An9EtLH0'

module.exports = CONFIG