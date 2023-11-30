"use strict"
const RESPONSE = require("../utilities/response");
const UTILITIES = require("../utilities");
const CONFIG = require('../config')
const model = require("../models/mysql")
const tMerchant =model.merchants
const tUser =model.users
const tAccount =model.accounts

module.exports.checkUser = async (req, res, next) => { 
    let user  = null
    try{
        user = await tUser.findOne({
            where: {
                id: {[Op.eq]: req.header("X-USER-ID")}, 
                merchant_id: req.header('X-MERCHANT-ID'), 
                deleted: {[Op.eq]: 0}
            },
            order: [["created_on", "desc"]]
        })
    } catch (err) {
        console.log(err)
        const response = RESPONSE.error("system")
        response.error_message += err
        return res.status(401).json(response)
    }

    if(!user){
        const response = RESPONSE.error("system")
        response.error_message += 'Akun Anda tidak ditemukan.'
        return res.status(404).json(response)
    }

    req.app.locals.user = user
    next()
}

module.exports.checkHeader = async (req, res, next) => { 
    const merchant = await tMerchant.findOne({
        raw: true,
        where: {
            package_name: req.header('X-Merchant-ID') || null,
            deleted: {[Op.eq]: 0}
        }
    })
    if(!merchant){
        const response = RESPONSE.error("forbidden")
        response.error_message = `Tidak diperkenankan melakukan akses. Toko Anda tidak dikenali.`
        return res.status(400).json(response)
    }
    req.app.locals.merchant = university
    next()
}

module.exports.checkAccount = async (req, res, next) => { 
    let account  = null
    try{
        account = await tAccount.findOne({
            where: {
                id: {[Op.eq]: req.header("X-Account-ID")},  
                merchant_id: {[Op.eq]: req.header("X-Merchant-ID")},  
                deleted: {[Op.eq]: 0}
            },
            order: [["created_on", "desc"]]
        })
    } catch (err) {
        console.log(err)
        const response = RESPONSE.error("system")
        response.error_message += err
        return res.status(401).json(response)
    }

    if(!account){
        const response = RESPONSE.error("system")
        response.error_message += 'Akun Anda tidak ditemukan.'
        return res.status(404).json(response)
    }

    req.app.locals.account = account
    next()
}