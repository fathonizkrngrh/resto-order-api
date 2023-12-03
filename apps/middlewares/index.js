"use strict"
const Op = require('sequelize').Op
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
        response.error_message += 'Akun Anda not found.'
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
    if(merchant.active === 0){
        const response = RESPONSE.error("forbidden")
        response.error_message = `Toko ini sedang tidak aktif.`
        return res.status(400).json(response)
    }
    req.app.locals.merchant = merchant
    next()
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