"use strict";
const Op = require('sequelize').Op
const pagination = require("../../utilities/pagination");
const RESPONSE = require("../../utilities/response");
const UTILITIES = require("../../utilities");
const CONFIG = require('../../config')
const model = require("../../models/mysql")
const seq = model.sequelize
const tUser = model.users
const tCart = model.carts
const tProduct = model.products
const tTransaction = model.transactions
const tTransactionDetail = model.transaction_details
const catchMessage = `Mohon maaf telah terjadi gangguan, jangan panik kami akan terus meningkatkan layanan.`


module.exports.list = async (req, res) => {
    const page              = req.query.page || 0
    const size              = req.query.size || 10
    const { limit, offset } = pagination.parse(page, size)
    const app               = req.app.locals

    let { order_by, order_type } = req.query

    const exclude = ['modified_on', 'deleted']

    try {
        const list = await tTransaction.findAndCountAll({
            attributes: { exclude: exclude },
            where: {
                deleted: { [Op.eq]: 0 },
                merchant_id: { [Op.eq]: app.merchant_id },
                user_id: { [Op.eq]: app.user_id },
            },
            include: [{
                model: tTransactionDetail, required: true, as: 'details', attributes: { exclude: exclude },
                include: [{
                    model: tProduct, required: false, as: 'product', attributes: { exclude: exclude },
                }]
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
    const body  = req.body
    const app   = req.app.locals
    const dbTrx = await seq.transaction()

    if (!body.table_number) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Permintaan tidak lengkap.`
        return res.status(400).json(response)
    }

    const exclude = ['created_on', 'modified_on', 'deleted']

    const carts = await tCart.findAll({
        where: {
            merchant_id: { [Op.eq]: app.merchant_id},
            user_id: { [Op.eq]: app.user_id},
            deleted: { [Op.eq]: 0 },
            status: { [Op.eq]: 'waiting' },
        },
        include: [{
            model: tProduct, required: false, as: 'product', 
            attributes: { exclude: exclude }
        }]
    })
    if (!carts.length > 0) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Keranjang masih kosong.`
        return res.status(400).json(response)
    }

    const converted = app.merchant_id.split('.').map(word => word.charAt(0).toUpperCase()).join('');
    const trx_code = [`${converted}`.padEnd(4, '0'), String(Math.round((new Date()).getTime()))].join('')

    let transaction = {
        tax: 0,
        total: 0,
        subtotal: 0,
        point: 0,
    }
    let transaction_details = [], updatedCarts = []
    carts.forEach( async (cart) => {
        const product = cart.product
        if (!product) {
            const response = RESPONSE.error('unknown')
            response.error_message = `Produk tidak ditemukan.`
            return res.status(400).json(response)
        }
        if (product.stock == 0 && product.ready == 0) {
            const response = RESPONSE.error('unknown')
            response.error_message = `Produk ${product.name} sedang tidak tersedia.`
            return res.status(400).json(response)
        }
        if (product.type == 'stock' && (+cart.qty < +product.stock)) {
            const response = RESPONSE.error('unknown')
            response.error_message = `Stok produk ${product.name} tidak tersedia.`
            return res.status(400).json(response)
        }
        // create transaction details
        transaction_details.push({
            merchant_id: app.merchant_id, user_id: app.user_id,
            trx_code, cart_id: cart.id, product_id: product.id,
            qty: cart.qty, notes: cart.notes,
            subtotal: cart.subtotal, tax: cart.tax, total: cart.total
        })
        // transaction attributes
        transaction.tax += +cart.tax
        transaction.total += +cart.total
        transaction.subtotal += +cart.subtotal
        transaction.point += +product.point * +cart.qty

        updatedCarts.push(
            await tCart.update({ status: 'ordered'}, { where: {
                merchant_id: { [Op.eq]: app.merchant_id },
                user_id: { [Op.eq]: app.user_id },
                deleted: { [Op.eq]: 0 }, 
                id: { [Op.eq]: cart.id },
            }}, { transaction: dbTrx })
        )
    });

    transaction = {
        ...transaction, trx_code,
        merchant_id: app.merchant_id, user_id: app.user_id,
        table_number: body.table_number, status: 'waiting',
    }

    try {
        await Promise.all([
            tTransactionDetail.bulkCreate(transaction_details, { transaction: dbTrx}),
            updatedCarts
        ])
        const trx = await tTransaction.create(transaction, { transaction: dbTrx})

        await dbTrx.commit()
        const response = RESPONSE.default
        response.data  = { transaction: trx, transaction_details}
        return res.status(200).json(response)   
    } catch (err) {
        console.log(err)
        await dbTrx.rollback()
        const response = RESPONSE.error('unknown')
        response.error_message = err.message || catchMessage
        return res.status(500).json(response)
    }
}

module.exports.approve = async (req, res) => {
    const body  = req.body
    const app   = req.app.locals
    const dbTrx = await seq.transaction()

    if (!body.transaction_id) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Permintaan tidak lengkap.`
        return res.status(400).json(response)
    }

    const exclude = ['created_on', 'modified_on', 'deleted']

    const trxs = await tTransaction.findOne({
        where: {
            merchant_id: { [Op.eq]: app.merchant_id},
            user_id: { [Op.eq]: app.user_id},
            deleted: { [Op.eq]: 0 },
            id: { [Op.eq]: body.transaction_id },
        },
        include: [{
            model: tTransactionDetail, required: true, as: 'details', attributes: { exclude: exclude },
            include: [{
                model: tProduct, required: true, as: 'product', attributes: { exclude: exclude },
            }]
        }]
    })
    if (!trxs) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Transaksi tidak ditemukan.`
        return res.status(400).json(response)
    }

    let updatedProducts = []
    trxs.details.forEach( async (trx) => {
        const product = trx.product
        // update product
        updatedProducts.push(
            await tProduct.update({
                ...product.type == 'stock' && { stock: +product.stock - +trx.qty },
                total_order: +product.total_order + trx.qty
            },{
                where: {
                    merchant_id: { [Op.eq]: app.merchant_id },
                    id: { [Op.eq]: product.id },
                    deleted: { [Op.eq]: 0 },
                }
            }, { transaction: dbTrx })
        )
    });

    try {
        // if (body?.with_points == 'true') {
            
        // } else {
        //     await tUser.update({
        //         total_points: +app.total_points + +transaction.point,
        //         current_points: +app.current_points + +transaction.point,
        //     }, { 
        //         where: {
        //             merchant_id: { [Op.eq]: app.merchant_id },
        //             id: { [Op.eq]: app.user_id },
        //             deleted: { [Op.eq]: 0 },
        //         }
        //     })
        // }

        await Promise.all([ updatedProducts ])

        await trxs.update({ status: 'unpaid' }, { transaction: dbTrx})

        const response = RESPONSE.default
        response.data  = { status: "success"}
        return res.status(200).json(response)   
    } catch (err) {
        console.log(err)
        const response = RESPONSE.error('unknown')
        response.error_message = err.message || catchMessage
        return res.status(500).json(response)
    }
}

module.exports.check_status = async (req, res) => {
    const app  = req.app.locals
    const body = req.body

    if (!body.id) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Permintaan tidak lengkap. Masukka ID dari transaksi`
        return res.status(400).json(response)
    }
    const exclude = ['modified_on', 'deleted']

    try {
        const trx = await tTransaction.findOne({
            attributes: { exclude: exclude },
            raw: true, where: {
                deleted: { [Op.eq]: 0 },
                merchant_id: { [Op.eq]: app.merchant_id },
                user_id: { [Op.eq]: app.user_id },
                id: { [Op.eq]: body.id },
            },
            include: [{
                model: tTransactionDetail, required: true, as: 'details', attributes: {exclude: exclude},
                include: [{
                    model: tProduct, required: true, as: 'product', attributes: { exclude: exclude },
                }]
            }],
        })

        if (!trx) {
            const response = RESPONSE.error('unknown')
            response.error_message = `Transaksi tidak ditemukan.`
            return res.status(400).json(response)
        }

        const response = RESPONSE.default
        response.data  = trx
        return res.status(200).json(response)   
    } catch (err) {
        console.log(err)
        const response = RESPONSE.error('unknown')
        response.error_message = err.message || catchMessage
        return res.status(500).json(response)
    }
}