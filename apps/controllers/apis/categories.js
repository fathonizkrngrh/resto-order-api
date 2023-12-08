"use strict";
const Op = require('sequelize').Op
const pagination = require("../../utilities/pagination");
const RESPONSE = require("../../utilities/response");
const UTILITIES = require("../../utilities");
const CONFIG = require('../../config')
const model = require("../../models/mysql")
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
    const app = req.app.locals
    console.log(app)

    let { order_by, order_type, with_products } = req.query

    const whereClause = (query) => ({
        deleted: { [Op.eq]: 0 },
        merchant_id: { [Op.eq]: app.merchant_id},
        ...query.id && { id: {[Op.eq]: query.id } },
    })

    const whereProductClause = (query) => ({
        deleted: { [Op.eq]: 0 },
        merchant_id: { [Op.eq]: app.merchant_id},
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
            order: [[order_by || 'id', order_type || 'ASC']],
            ...req.query.pagination == 'true' && {
                offset      : offset,
                limit       : limit
            },
            ...with_products == 'true' && {
                include: [{
                    model: tProduct, as: 'products', required: true,
                    attributes: {exclude: ['created_on', 'modified_on', 'deleted']},
                    where: whereProductClause(req.query),
                    order: [['price', 'ASC']]
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
