"use strict";
const Op = require('sequelize').Op
const pagination = require("../../utilities/pagination");
const RESPONSE = require("../../utilities/response");
const UTILITIES = require("../../utilities");
const CONFIG = require('../../config')
const model = require("../../models/mysql")
const tCart = model.carts
const tProduct = model.products
const catchMessage = `Mohon maaf telah terjadi gangguan, jangan panik kami akan terus meningkatkan layanan.`


/**
 * Function List of Cart's
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.list = async (req, res) => {
    const page              = req.query.page || 0
    const size              = req.query.size || 10
    const { limit, offset } = pagination.parse(page, size)
    const app               = req.app.locals

    let { order_by, order_type } = req.query

    try {
        const list = await tCart.findAll({
            raw: true, attributes: { exclude: ['modified_on', 'deleted'] },
            where: {
                deleted: { [Op.eq]: 0 },
                merchant_id: { [Op.eq]: app.merchant_id },
                user_id: { [Op.eq]: app.user_id },
                status: { [Op.eq]: 'waiting' },
            },
            include: [{
                model: tProduct, required: true, as: 'product', attributes: ['name', 'image', 'price', 'point']
            }],
            ...req.query.pagination == 'true' && {
                offset      : offset,
                limit       : limit
            },
            order: [[order_by || 'created_on', order_type || 'DESC']]
        })

        const cart = {
            qty: 0,
            subtotal: 0,
            tax: 0,
            total: 0,
            points: 0
        }
        await list.forEach(data => {
            console.log(data)
            cart.qty += +data.qty
            cart.subtotal += +data.subtotal
            cart.tax += +data.tax
            cart.total += +data.total
            cart.points += +data["product.point"] * +data.qty
            data.point = +data["product.point"] * +data.qty
        });

        const response = RESPONSE.default
        response.request_param = req.query
        response.data  = { ...cart, details: list}
        return res.status(200).json(response)   
    } catch (err) {
        console.log(err)
        const response = RESPONSE.error('unknown')
        response.error_message = err.message || catchMessage
        return res.status(500).json(response)
    }
}

/**
 * Function Count of Cart's
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.count = async (req, res) => {
    const app               = req.app.locals

    try {
        const total = await tCart.count({
            attributes: { exclude: ['modified_on', 'deleted'] },
            where: {
                deleted: { [Op.eq]: 0 },
                merchant_id: { [Op.eq]: app.merchant_id },
                user_id: { [Op.eq]: app.user_id },
                status: { [Op.eq]: 'waiting' },
            },
        })

        const response = RESPONSE.default
        response.data  = { total: total}
        return res.status(200).json(response)   
    } catch (err) {
        console.log(err)
        const response = RESPONSE.error('unknown')
        response.error_message = err.message || catchMessage
        return res.status(500).json(response)
    }
}

/**
 * Function Create Cart's
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.add_to_cart = async (req, res) => {
    const body  = req.body
    const app   = req.app.locals

    if (!body.product_id || !body.qty ) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Permintaan tidak lengkap.`
        return res.status(400).json(response)
    }

    const product = await tProduct.findOne({raw: true, where: {
        merchant_id: { [Op.eq]: app.merchant_id},
        deleted: { [Op.eq]: 0 },
        id: {[Op.eq]: body.product_id }}
    })
    if (!product) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Produk not found.`
        return res.status(400).json(response)
    }
    if (product.stock == 0 && product.ready == 0) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Produk sedang tidak tersedia.`
        return res.status(400).json(response)
    }
    if (product.type == 'stock' && (+body.qty > +product.stock)) {
        console.log('masuk 1')
        const response = RESPONSE.error('unknown')
        response.error_message = `Stok produk ${product.name} tidak tersedia.`
        return res.status(400).json(response)
    }
    if (+body.qty > +20) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Mencapai pembelian maksimal produk ${product.name}.`
        return res.status(400).json(response)
    }

    try {
        const cart = {
            merchant_id: app.merchant_id ,
            user_id: app.user_id ,
            product_id: body.product_id,
            qty: +body.qty,
            subtotal: +product.price * +body.qty,
            tax: (+product.price * 0.1) * +body.qty,
            total: ((+product.price * 0.1) + +product.price) * +body.qty,
            status: 'waiting',
            notes: body?.notes
        }

        let result
        const existCart = await tCart.findOne({
            where: {
                merchant_id: { [Op.eq]: app.merchant_id},
                deleted: { [Op.eq]: 0 },
                product_id: {[Op.eq]: body.product_id },
                status: {[Op.eq]: 'waiting' }
            }
        })
        if (existCart) {
            if (product.type == 'stock' && (+cart.qty < +product.stock)) {
                const response = RESPONSE.error('unknown')
                response.error_message = `Stok produk ${product.name} tidak tersedia.`
                return res.status(400).json(response)
            }
            result = {
                qty: +cart.qty + +existCart.qty,
                subtotal: +cart.subtotal + +existCart.subtotal,
                tax: +cart.tax + +existCart.tax,
                total: +cart.total + +existCart.total,
                notes: body.notes ? (existCart.notes ? existCart.notes + "|" + body?.notes : body.notes) : existCart.notes
            }
            await existCart.update(result)
            result.id = existCart.id
        } else {
            result = await tCart.create(cart)
        }

        const response = RESPONSE.default
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
 * Function Delete Cart's
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.delete = async (req, res) => {
    const body = req.body

    if (!body.cart_id ) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Permintaan tidak lengkap.`
        return res.status(400).json(response)
    }

    try {
        const deleted = await tCart.update({ deleted: 1}, { 
            where: { id: { [Op.eq]: body.cart_id }, deleted: { [Op.eq]: 0 } }
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