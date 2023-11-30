"use strict";
const Op = require('sequelize').Op
const Pagination = require("../utilities/pagination");
const RESPONSE = require("../utilities/response");
const UTILITIES = require("../utilities");
const CONFIG = require('../config')
const model = require("../models/mysql")
const tAccount = model.accounts
const tSession = model.sessions

module.exports.signin = async (req, res) => {
    const { email, phone, password } = req.body

    if ((!email || !password) && (!phone || !password)) {
        const response = RESPONSE.error('unknown')
        response.error_message = 'Permintaan tidak lengkap. Masukkan Email atau No. Handphone dan Password'
        return res.status(400).json(response)
    }

    try {
        const account = await tAccount.findOne({
            raw: true,
            where: { 
                merchant_id: { [Op.eq]: req.header('X-MERCHANT-ID')}, 
                deleted: { [Op.eq]: 0 }, 
                ...email && { email: { [Op.eq]: email}},
                ...phone && { phone: { [Op.eq]: phone}}},     
        })
        if (!account) {
            const response = RESPONSE.error('unknown')
            response.error_message = 'Akun Pengguna tidak ditemukan'
            return res.status(400).json(response)
        }

        const hashed = require('crypto').createHash('sha1').update(`${password.trim()}${CONFIG.password_key_encrypt}`).digest('hex')
        if (hashed !== account.password) {
            const response = RESPONSE.error('unknown')
            response.error_message = 'Kombinasi email dan password tidak dikenal.'
            return res.status(400).json(response)
        }

        if (account.role !== 'admin' && account.role !== 'super_admin') {
            const response = RESPONSE.error('unknown')
            response.error_message = 'Akses ditolak!!'
            return res.status(401).json(response)
        }

        const response = RESPONSE.default;
        response.data = {
            phone: account.phone,
            merchant_id: account.merchant_id,
            email: account.email,
            username: account.username,
            role: account.role,
            staff_id: account?.staff_id || null,
        };
        res.status(200).send(response);
    } catch (error) {
        console.log(error)
        const response = RESPONSE.error("unknown");
        response.error_message = "Tidak dapat menyimpan data. Silahkan laporakan kendala ini.";
        res.status(400).send(response);
    }
};

module.exports.register = async (req, res) => {
    // Destructure request body for required data
    let {
        role, username, phone, email, password, staff_id
    } = req.body

    try {
        const requiredAttributes = { username: "username", role: "Role", email: 'Email', phone: 'Nomor Telepon', password: 'Password' }
        for (const key of Object.keys(requiredAttributes)) {
            if (!req.body[key]) {
                const response = RESPONSE.error('unknown')
                response.error_message = `${requiredAttributes[key]} wajib diisi.`
                return res.status(400).json(response)
            }
        }
        phone = UTILITIES.parsePhoneNumber(phone)
        const passwordHash = require('crypto').createHash('sha1').update(`${password.trim()}${CONFIG.password_key_encrypt}`).digest('hex')
       
        const checkAccount = await tAccount.findOne({
            raw: true,
            where: {
                merchant_id: { [Op.eq]: req.header('X-MERCHANT-ID') },
                email: { [Op.eq]: email },
                phone: { [Op.eq]: phone },
                deleted: { [Op.eq]: 0 }
            }
        })
        if (checkAccount && checkAccount.email.toLowerCase() === email.toLowerCase()) {
            const response = RESPONSE.error('unknown')
            response.error_message = `Email/Phone sudah terdaftar. Silahkan gunakan email yang lain.`
            return res.status(400).json(response)
        }

        const newAccount = await tAccount.create({ role, username, phone, email, staff_id, password: passwordHash, merchant_id: req.header('X-MERCHANT-ID') })
        const response = RESPONSE.default
        response.data = { id: newAccount.id, role, username, phone, email, staff_id }
        return res.status(200).json(response)
    } catch (error) {
        // Log the error and rollback the transaction in case of an exception
        console.log(error)
        // Prepare and send an error response
        const response = RESPONSE.error('unknown')
        response.error_message = 'Tidak dapat menyimpan data. Silahkan laporakan kendala ini.'
        return res.status(500).json(response)
    }
}

//http://www.mysqltutorial.org/mysql-nodejs/
//https://webapplog.com/handlebars/
