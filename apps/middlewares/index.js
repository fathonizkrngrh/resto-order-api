"use strict"
const Op = require('sequelize').Op
const RESPONSE = require("../utilities/response");
const UTILITIES = require("../utilities");
const CONFIG = require('../config')
const model = require("../models/mysql");
const jwt = require('../utilities/token');
const tMerchant =model.merchants
const tUser =model.users
const tAccount =model.accounts

module.exports.authentication = async (req, res, next) => { 
    const bearer = req.header("Authorization");
    if (!bearer) {
        const response = RESPONSE.error("authorization")
        response.error_message += "Authorization header missing"
        return res.status(401).json(response)
    }

    const token = bearer.split(" ")[1];
    if (!token) {
        const response = RESPONSE.error("authorization")
        response.error_message += "Unauthorized. Please login to continue."
        return res.status(401).json(response)
    }
    console.log(token)

    try {
        const decoded = jwt.verifyToken(token)
        if (!decoded) {
            const response = RESPONSE.error("authorization")
            response.error_message += "Unauthorized. Please login to continue."
            return res.status(401).json(response)
        }

        let user
        try{
            user = await tUser.findOne({ raw: true, where: { id: {[Op.eq]: decoded.user_id}, merchant_id: {[Op.eq]: decoded.merchant_id}, deleted: {[Op.eq]: 0}}})
        } catch (err) {
            console.log(err)
            const response = RESPONSE.error("system")
            response.error_message += err
            return res.status(401).json(response)
        }

        if(!user){
            const response = RESPONSE.error("authorization")
            response.error_message += 'Akun anda tidak terdaftar.'
            return res.status(401).json(response)
        }

        req.app.locals = { user_id: decoded.user_id, merchant_id: decoded.merchant_id }
        next()
    } catch (err) {
        if (err.name === "JsonWebTokenError") {
            const response = RESPONSE.error("authorization")
            response.error_message += "Invalid Token. Please login to continue."
            return res.status(401).json(response)
        }
        if (err.name === "TokenExpiredError") {
            const response = RESPONSE.error("authorization")
            response.error_message += "Token Expired. Please login to continue."
            return res.status(401).json(response)
        }
    }
}

module.exports.checkAdmin = async (req, res, next) => { 
    let account  = null, merchant = null
    const session = req.session.user
    if(!session){
        req.flash("alertMessage", "Sesi anda habis. Silahkan Login Kembali");
        req.flash("alertStatus", "danger");
        return res.redirect("/admin/signin");
    }

    try{
        account = await tAccount.findOne({ raw: true, where: { id: {[Op.eq]: session.id}, deleted: {[Op.eq]: 0}}})
        if(!account){
            req.flash("alertMessage", "Anda tidak terdaftar pada aplikasi ini");
            req.flash("alertStatus", "danger");
            return res.redirect("/admin/signin");
        }
        merchant = await tMerchant.findOne({
            raw: true, where: {
                package_name: {[Op.eq]: session.merchant_id},   
                deleted: {[Op.eq]: 0}
            },
            attributes: ['id', 'package_name', 'name']
        })
        if(!account){
            req.flash("alertMessage", "Merchant anda tidak terdaftar pada aplikasi ini");
            req.flash("alertStatus", "danger");
            return res.redirect("/admin/signin");
        }
    } catch (err) {
        console.log(err)
        req.flash("alertMessage", `${err.message}`);
        req.flash("alertStatus", "danger");
        return res.redirect("/admin/signin");
    }

    let merchants
    if (session.role === 'superadmin') {
        merchants = await tMerchant.findAll({where: { deleted: { [Op.eq]: 0 }}, attributes: ['id', 'package_name', 'name']})
    }

    req.app.locals = {
        user: session,
        merchant: merchant,
        merchants: merchants
    }
    next()
}

module.exports.checkSuperAdmin = async (req, res, next) => { 
    
    const { user, merchant } = req.app.locals;
    console.log("user dari middleware super admin", user)

    if(user.role !== 'superadmin'){
        req.flash("alertMessage", "Anda tidak memiliki akses untuk halaman ini");
        req.flash("alertStatus", "danger");
        return res.redirect("/admin");
    }

    next()
}