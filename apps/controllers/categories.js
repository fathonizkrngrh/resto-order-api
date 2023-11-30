"use strict";
const Op = require('sequelize').Op
const pagination = require("../utilities/pagination");
const RESPONSE = require("../utilities/response");
const UTILITIES = require("../utilities");
const CONFIG = require('../config')
const model = require("../models/mysql")
const tCategory =model.categories
const tProduct =model.products
const catchMessage = `Mohon maaf telah terjadi gangguan, jangan panik kami akan terus meningkatkan layanan.`


/**
 * Function List of Categories
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.list = async (req, res) => {
    const page              = req.query.page || 0
    const size              = req.query.size || 10
    const { limit, offset } = pagination.parse(page, size)

    let { order_by, order_type, with_products } = req.query

    const whereClause = (query) => ({
        deleted: { [Op.eq]: 0 },
        merchant_id: { [Op.eq]: req.header('x-merchant-id')},
        ...query.id && { id: {[Op.eq]: query.id } },
        ...query.search && { 
            [Op.or]: {
                name: { [Op.like]: `%${query.search}%` },
            }
        }
    })

    try {
        const list = await tCategory.findAndCountAll({
            attributes: { exclude: ['created_on', 'modified_on', 'deleted'] },
            where: whereClause(req.query),
            ...req.query.pagination == 'true' && {
                offset      : offset,
                limit       : limit
            },
            ...order_by && order_type && {
                order: [[order_by, order_type]]
            },
            ...with_products && {
                include: [{
                    model: tProduct, as: 'products', required: false,
                    attributes: {exclude: ['created_on', 'modified_on', 'deleted']},
                    where: { deleted: {[Op.eq]: 0}},
                }],
                distinct: true,
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
 * Function Detail of Categories
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.detail = async (req, res) => {
    let { id, with_products } = req.query

    if (!id ) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Permintaan tidak lengkap.`
        return res.status(400).json(response)
    }

    const whereClause = (query) => ({
        merchant_id: { [Op.eq]: req.header('x-merchant-id')},
        deleted: { [Op.eq]: 0 },
        id: {[Op.eq]: query.id }
    })

    try {
        const result = await tCategory.findOne({
            attributes: { exclude: ['created_on', 'modified_on', 'deleted'] },
            where: whereClause(req.query),
            ...with_products && {
                include: [{
                    model: tProduct, as: 'products', required: false,
                    attributes: {exclude: ['created_on', 'modified_on', 'deleted']},
                    where: { deleted: {[Op.eq]: 0}},
                }],
                distinct: true,
            }
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
 * Function Create Categories
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
        const created = await tCategory.create({
            merchant_id: req.header('x-merchant-id'),
            name: body.name,
            icon: body?.icon || null,
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
 * Function Update Categories
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.update = async (req, res) => {
    const body = req.body

    if (!body.category_id ) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Permintaan tidak lengkap.`
        return res.status(400).json(response)
    }

    try {
        const category = await tCategory.findOne({ where: {
            merchant_id: { [Op.eq]: req.header('x-merchant-id')}, 
            id: { [Op.eq]: body.category_id }, 
            deleted: { [Op.eq]: 0 } }
        })
        if (!category) {
            const response = RESPONSE.error('unknown')
            response.error_message = `Kategori tidak ditemukan.`
            return res.status(400).json(response)
        }    

        const keys = Object.keys(req.body)
        keys.forEach((key, index) => category[key] = req.body[key] )
        await category.save()

        const response = RESPONSE.default
        response.data  = category
        return res.status(200).json(response)   
    } catch (err) {
        console.log(err)
        const response = RESPONSE.error('unknown')
        response.error_message = err.message || catchMessage
        return res.status(500).json(response)
    }
}

/**
 * Function Delete Categories
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
        const deleted = await tCategory.update({ deleted: 1}, { 
            where: {
                merchant_id: { [Op.eq]: req.header('x-merchant-id')},
                id: { [Op.eq]: body.category_id }, 
                deleted: { [Op.eq]: 0 } 
            }
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