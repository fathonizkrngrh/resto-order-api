"use strict";
const Op = require('sequelize').Op
const pagination = require("../utilities/pagination");
const RESPONSE = require("../utilities/response");
const UTILITIES = require("../utilities");
const CONFIG = require('../config')
const model = require("../models/mysql")
const tCart = model.carts
const tProduct = model.products
const tTransaction = model.transactions
const tTransactionDetail = model.transaction_details
const catchMessage = `Mohon maaf telah terjadi gangguan, jangan panik kami akan terus meningkatkan layanan.`


module.exports.list = async (req, res) => {
    const page              = req.query.page || 0
    const size              = req.query.size || 10
    const { limit, offset } = pagination.parse(page, size)

    let { order_by, order_type } = req.query

    try {
        const list = await tTransaction.findAndCountAll({
            attributes: { exclude: ['modified_on', 'deleted'] },
            raw: true,
            where: {
                deleted: { [Op.eq]: 0 },
                merchant_id: { [Op.eq]: req.header("X-merchant-ID") },
                user_id: { [Op.eq]: req.header("X-USER-ID") },
            },
            include: [{
                model: tTransactionDetail, required: true, as: 'details', attributes: {exclude: ['created_on', 'modified_on', 'deleted']}
            }],
            ...req.query.pagination == 'true' && {
                offset      : offset,
                limit       : limit
            },
            order: [[order_by || 'created_on', order_type || 'DESC']]
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

module.exports.checkout = async (req, res) => {
    const body = req.body

    if (!body.table_number) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Permintaan tidak lengkap.`
        return res.status(400).json(response)
    }

    const product = await tProduct.findOne({raw: true, where: {
        merchant_id: { [Op.eq]: req.header('x-merchant-id')},
        deleted: { [Op.eq]: 0 },
        product_id: {[Op.eq]: body.product_id }}
    })
    if (!product) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Produk tidak ditemukan.`
        return res.status(400).json(response)
    }
    if (product.stock == 0 && product.ready == 0) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Produk sedang tidak tersedia.`
        return res.status(400).json(response)
    }
    if (+qty > +20) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Mencapai pembelian maksimal produk ${product.name}.`
        return res.status(400).json(response)
    }

    const discountPrice = product.discount_type ? ( product.discount_type == 'fee' ? +product.discount_amount : +product.price * product.discount_amount ) : 0
    const curentPrice = +product.price - +discountPrice

    try {
        const created = await tCart.create({
            merchant_id: req.header('x-merchant-id') ,
            user_id: req.header('x-user-id') ,
            qty: +body.qty,
            subtotal: curentPrice,
            total: +curentPrice * +body.qty,
            status: 'waiting',
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