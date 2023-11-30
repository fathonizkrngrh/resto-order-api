"use strict";
const Op = require('sequelize').Op
const pagination = require("../utilities/pagination");
const RESPONSE = require("../utilities/response");
const UTILITIES = require("../utilities");
const CONFIG = require('../config')
const model = require("../models/mysql")
const tMerchant =model.merchants
const catchMessage = `Mohon maaf telah terjadi gangguan, jangan panik kami akan terus meningkatkan layanan.`


/**
 * Function List of Merchant's
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.list = async (req, res) => {
    const page              = req.query.page || 0
    const size              = req.query.size || 10
    const { limit, offset } = pagination.parse(page, size)

    let { order_by, order_type } = req.query

    const whereClause = (query) => ({
        deleted: { [Op.eq]: 0 },
        ...query.id && { id: {[Op.eq]: query.id } },
        ...query.active && { active: {[Op.eq]: query.active } },
        ...query.search && { 
            [Op.or]: {
                name: { [Op.like]: `%${query.search}%` },
            }
        }
    })

    try {
        const list = await tMerchant.findAndCountAll({
            attributes: { exclude: ['created_on', 'modified_on', 'deleted'] },
            where: whereClause(req.query),
            ...req.query.pagination == 'true' && {
                offset      : offset,
                limit       : limit
            },
            ...order_by && order_type && {
                order: [[order_by, order_type]]
            }
        })

        const response = RESPONSE.default
        response.request_param = req.query
        response.data  = pagination.data(list, page, size)
        return res.status(200).json(response)   
    } catch (err) {
        console.log(err)
        const response = RESPONSE.error('unknown')
        response.error_message = err.message || catchMessage
        return res.status(500).json(response)
    }
}

/**
 * Function Detail of Merchant's
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.detail = async (req, res) => {
    let { id } = req.query

    if (!id ) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Permintaan tidak lengkap.`
        return res.status(400).json(response)
    }

    const whereClause = (query) => ({
        deleted: { [Op.eq]: 0 },
        id: {[Op.eq]: query.id }
    })

    try {
        const result = await tMerchant.findOne({
            attributes: { exclude: ['created_on', 'modified_on', 'deleted'] },
            where: whereClause(req.query),
        })

        const response = RESPONSE.default
        response.request_param = req.query
        response.data  = result
        return res.status(200).json(response)   
    } catch (err) {
        console.log(err)
        const response = RESPONSE.error('unknown')
        response.error_message = err.message || catchMessage
        return res.status(500).json(response)
    }
}

/**
 * Function Create Merchant's
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.create = async (req, res) => {
    const body = req.body

    if (!body.name ) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Permintaan tidak lengkap.`
        return res.status(400).json(response)
    }

    try {
        const created = await tMerchant.create({
            name: body.name,
            package_name: body.package_name,
            location: body.location,
            facebook: body?.facebook,
            instagram: body?.instagram,
            active: body?.active || 1,
            logo: body?.logo || null,
        })

        const response = RESPONSE.default
        response.data  = created
        return res.status(200).json(response)   
    } catch (err) {
        console.log(err)
        const response = RESPONSE.error('unknown')
        response.error_message = err.message || catchMessage
        return res.status(500).json(response)
    }
}

/**
 * Function Update Merchant's
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.update = async (req, res) => {
    const body = req.body

    if (!body.id ) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Permintaan tidak lengkap.`
        return res.status(400).json(response)
    }

    try {
        const merchant = await tMerchant.findOne({ where: { id: { [Op.eq]: body.id }, deleted: { [Op.eq]: 0 } }})
        if (!merchant) {
            const response = RESPONSE.error('unknown')
            response.error_message = `Kategori tidak ditemukan.`
            return res.status(400).json(response)
        }    

        const keys = Object.keys(req.body)
        keys.forEach((key, index) => merchant[key] = req.body[key] )
        await merchant.save()

        const response = RESPONSE.default
        response.data  = merchant
        return res.status(200).json(response)   
    } catch (err) {
        console.log(err)
        const response = RESPONSE.error('unknown')
        response.error_message = err.message || catchMessage
        return res.status(500).json(response)
    }
}

/**
 * Function Delete Merchant's
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.delete = async (req, res) => {
    const body = req.body

    if (!body.category_id ) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Permintaan tidak lengkap.`
        return res.status(400).json(response)
    }

    try {
        const deleted = await tMerchant.update({ deleted: 1}, { 
            where: { id: { [Op.eq]: body.category_id }, deleted: { [Op.eq]: 0 } }
        })

        const response = RESPONSE.default
        response.data  = deleted
        return res.status(200).json(response)   
    } catch (err) {
        console.log(err)
        const response = RESPONSE.error('unknown')
        response.error_message = err.message || catchMessage
        return res.status(500).json(response)
    }
}