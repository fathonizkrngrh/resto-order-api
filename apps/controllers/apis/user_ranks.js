"use strict";
const Op = require('sequelize').Op
const pagination = require("../../utilities/pagination");
const RESPONSE = require("../../utilities/response");
const UTILITIES = require("../../utilities");
const CONFIG = require('../../config')
const model = require("../../models/mysql");
const tUser =model.users
const catchMessage = `Mohon maaf telah terjadi gangguan, jangan panik kami akan terus meningkatkan layanan.`

/**
 * Function List of Rank Products
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.rank = async (req, res) => {
    const page              = req.query.page || 0
    const size              = req.query.size || 10
    const { limit, offset } = pagination.parse(page, size)
    const app = req.app.locals

    const whereClause = (query) => ({
        deleted: { [Op.eq]: 0 },
        merchant_id: { [Op.eq]: app.merchant_id},
    })

    try {
        const list = await tUser.findAndCountAll({
            attributes: { exclude: ['created_on', 'modified_on', 'deleted'] },
            where: whereClause(req.query),
            ...req.query.pagination == 'true' && {
                offset      : offset,
                limit       : limit
            },
            order: [["total_points", "DESC"]]
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
