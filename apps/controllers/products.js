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
 * Function List of Products
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
        merchant_id: { [Op.eq]: req.header('x-merchant-id')},
        ...query.id && { id: {[Op.eq]: query.id } },
        ...query.category_id && { category_id: {[Op.eq]: query.category_id } },
        ...query.type && { type: {[Op.eq]: query.type } },
        ...query.ready && { ready: {[Op.eq]: query.ready } },
        ...query.search && { 
            [Op.or]: {
                name: { [Op.like]: `%${query.search}%` },
                code: { [Op.like]: `%${query.search}%` },
            }
        }
    })

    try {
        const list = await tProduct.findAndCountAll({
            attributes: { exclude: ['created_on', 'modified_on', 'deleted'] },
            where: whereClause(req.query),
            ...req.query.pagination == 'true' && {
                offset      : offset,
                limit       : limit
            },
            ...order_by && order_type && {
                order: [[order_by, order_type]]
            },
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
 * Function Detail of Products's
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
        merchant_id: { [Op.eq]: req.header('x-merchant-id')},
        deleted: { [Op.eq]: 0 },
        id: {[Op.eq]: query.id }
    })

    try {
        const result = await tProduct.findOne({
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
 * Function Create Products
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.create = async (req, res) => {
    const body = req.body

    if (!body.name || !body.category_id) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Permintaan tidak lengkap.`
        return res.status(400).json(response)
    }

    const category = await tCategory.findOne({ where: { 
        merchant_id: { [Op.eq]: req.header('x-merchant-id')},
        id: {[Op.eq]: body.category_id }, 
        deleted: {[Op.eq]: 0 } }
    })
    if (!category) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Kategori tidak ditemukan.`
        return res.status(400).json(response)
    }

    try {
        const created = await tProduct.create({
            merchant_id: req.header('x-merchant-id'),
            category_id: category.id,
            category_name: category.name,
            name: body.name,
            code: body.code,
            image: body.image,
            price: body.price,
            type: body.type || 'cook',
            stock: body.name || 0,
            ready: body.ready || 1,
            point: body.point || 0,
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
 * Function Update Products
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

    if (body.category_id) {
        const category = await tCategory.findOne({ where: { 
            merchant_id: { [Op.eq]: req.header('x-merchant-id')},
            id: {[Op.eq]: body.category_id }, 
            deleted: {[Op.eq]: 0 } }
        })
        if (!category) {
            const response = RESPONSE.error('unknown')
            response.error_message = `Kategori tidak ditemukan.`
            return res.status(400).json(response)
        }     
    }

    try {
        const product = await tProduct.findOne({ where: {
            merchant_id: { [Op.eq]: req.header('x-merchant-id')}, 
            id: { [Op.eq]: body.id }, 
            deleted: { [Op.eq]: 0 } }
        })
        if (!product) {
            const response = RESPONSE.error('unknown')
            response.error_message = `Kategori tidak ditemukan.`
            return res.status(400).json(response)
        }    
        
        const keys = Object.keys(req.body)
        keys.forEach((key, index) => product[key] = req.body[key] )
        await product.save()

        const response = RESPONSE.default
        response.data  = product
        return res.status(200).json(response)   
    } catch (err) {
        console.log(err)
        const response = RESPONSE.error('unknown')
        response.error_message = err.message || catchMessage
        return res.status(500).json(response)
    }
}

/**
 * Function Delete Products
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.delete = async (req, res) => {
    const body = req.body

    if (!body.id ) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Permintaan tidak lengkap.`
        return res.status(400).json(response)
    }

    try {
        const deleted = await tProduct.update({ deleted: 1}, { 
            where: { 
                merchant_id: { [Op.eq]: req.header('x-merchant-id')},
                id: { [Op.eq]: body.id }, 
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