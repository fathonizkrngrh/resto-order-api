"use strict";
const Op = require('sequelize').Op
const pagination = require("../../utilities/pagination");
const RESPONSE = require("../../utilities/response");
const UTILITIES = require("../../utilities");
const CONFIG = require('../../config')
const model = require("../../models/mysql");
const tCategory =model.categories
const tUser =model.users
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
    const app = req.app.locals

    let { order_by, order_type } = req.query

    const whereClause = (query) => ({
        deleted: { [Op.eq]: 0 },
        merchant_id: { [Op.eq]: app.merchant_id},
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
            include: [{
                model: tCategory, required: true, as: 'category',
                attributes: { exclude: ['created_on', 'modified_on', 'deleted'] },
            }],
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
 * Function List of Top Seller Products
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.top_seler = async (req, res) => {
    const page              = req.query.page || 0
    const size              = req.query.size || 10
    const { limit, offset } = pagination.parse(page, size)
    const app = req.app.locals

    const whereClause = (query) => ({
        deleted: { [Op.eq]: 0 },
        merchant_id: { [Op.eq]: app.merchant_id},
    })

    try {
        const list = await tProduct.findAndCountAll({
            attributes: { exclude: ['created_on', 'modified_on', 'deleted'] },
            where: whereClause(req.query),
            ...req.query.pagination == 'true' && {
                offset      : offset,
                limit       : limit
            },
            order: [["total_order", "DESC"]]
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
 * Function List of Rewards Products
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.rewards = async (req, res) => {
    const page              = req.query.page || 0
    const size              = req.query.size || 10
    const { limit, offset } = pagination.parse(page, size)
    const app = req.app.locals
    
    const user = await tUser.findOne({ 
        raw: true, where: {
            deleted: { [Op.eq]: 0 },
            merchant_id: { [Op.eq]: app.merchant_id},
            id: { [Op.eq]: app.user_id},
        },
        attributes: ['id', 'current_points']
    })

    console.log(user)

    const whereClause = (query) => ({
        deleted: { [Op.eq]: 0 },
        merchant_id: { [Op.eq]: app.merchant_id},
        point: { [Op.lt]: user.current_points},
    })

    try {
        const list = await tProduct.findAndCountAll({
            attributes: { exclude: ['created_on', 'modified_on', 'deleted'] },
            where: whereClause(req.query),
            ...req.query.pagination == 'true' && {
                offset      : offset,
                limit       : limit
            },

            order: [["point", "DESC"]]
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
