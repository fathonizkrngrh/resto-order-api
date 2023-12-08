"use strict";
const Op = require('sequelize').Op
const Pagination = require("../../utilities/pagination");
const RESPONSE = require("../../utilities/response");
const UTILITIES = require("../../utilities");
const CONFIG = require('../../config')
const model = require("../../models/mysql");
const { generateToken } = require('../../utilities/token');
const tUser = model.users

module.exports.signin = async (req, res) => {
    const { email, phone, password } = req.body

    if (!req.header('x-merchant-id')) {
        const response = RESPONSE.error('unknown')
        response.error_message = 'Permintaan tidak lengkap. Masukkan identitas merchant'
        return res.status(400).json(response)
    }
    if ((!email || !password) && (!phone || !password)) {
        const response = RESPONSE.error('unknown')
        response.error_message = 'Permintaan tidak lengkap. Masukkan Email atau No. Handphone dan Password'
        return res.status(400).json(response)
    }

    try {
        const user = await tUser.findOne({
            raw: true,
            where: { 
                merchant_id: { [Op.eq]: req.header('X-MERCHANT-ID')}, 
                deleted: { [Op.eq]: 0 }, 
                ...email && { email: { [Op.eq]: email}},
                ...phone && { phone: { [Op.eq]: UTILITIES.parsePhoneNumber(phone)}}},     
        })
        if (!user) {
            const response = RESPONSE.error('unknown')
            response.error_message = 'Pengguna tidak terdaftar..'
            return res.status(400).json(response)
        }

        const hashed = require('crypto').createHash('sha1').update(`${password.trim()}${CONFIG.password_key_encrypt}`).digest('hex')
        if (hashed !== user.password) {
            const response = RESPONSE.error('unknown')
            response.error_message = 'Kombinasi email dan password tidak dikenal.'
            return res.status(400).json(response)
        }

        const token = generateToken(user)

        const response = RESPONSE.default;
        response.data = {
            user_id: user.id,
            merchant_id: user.merchant_id,
            token: token
        };
        res.status(200).send(response);
    } catch (error) {
        console.log(error)
        const response = RESPONSE.error("unknown");
        response.error_message = "Tidak dapat mengambil data. Silahkan laporakan kendala ini.";
        res.status(400).send(response);
    }
};

module.exports.signup = async (req, res) => {
    // Destructure request body for required data
    let {
        username, email, password, password_confirmation, phone
    } = req.body

    try {
        const requiredAttributes = { username: "username", email: 'Email', phone: 'Nomor Telepon', password: 'Password', password_confirmation: "Password Konfirmasi" }
        for (const key of Object.keys(requiredAttributes)) {
            if (!req.body[key]) {
                const response = RESPONSE.error('unknown')
                response.error_message = `${requiredAttributes[key]} wajib diisi.`
                return res.status(400).json(response)
            }
        }

        if (password_confirmation !== password) {
            const response = RESPONSE.error('unknown')
            response.error_message = `Password Konfirmasi tidak sama.`
            return res.status(400).json(response)
        }

        const checkEmail = await tUser.findOne({
            raw: true,
            where: {
                merchant_id: { [Op.eq]: req.header('X-MERCHANT-ID') },
                email: { [Op.eq]: email },
                deleted: { [Op.eq]: 0 }
            }
        })

        if (checkEmail && checkEmail.email.toLowerCase() === email.toLowerCase()) {
            const response = RESPONSE.error('unknown')
            response.error_message = `Email sudah terdaftar. Silahkan gunakan email yang lain.`
            return res.status(400).json(response)
        }
        
        const checkPhone = await tUser.findOne({
            raw: true,
            where: {
                merchant_id: { [Op.eq]: req.header('X-MERCHANT-ID') },
                phone: { [Op.eq]: UTILITIES.parsePhoneNumber(phone) },
                deleted: { [Op.eq]: 0 }
            }
        })
        if (checkPhone && checkPhone.email.toLowerCase() === email.toLowerCase()) {
            const response = RESPONSE.error('unknown')
            response.error_message = `No. HP sudah terdaftar. Silahkan gunakan No. HP yang lain.`
            return res.status(400).json(response)
        }

        const passwordHash = require('crypto').createHash('sha1').update(`${password.trim()}${CONFIG.password_key_encrypt}`).digest('hex')
        
        const newUser = await tUser.create({ username, phone: UTILITIES.parsePhoneNumber(phone), email, password: passwordHash, merchant_id: req.header('X-MERCHANT-ID') })
        const response = RESPONSE.default
        response.data = newUser
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

module.exports.me = async (req, res) => {
    const app = req.app.locals

    const whereClause = () => ({
        deleted: { [Op.eq]: 0 },
        merchant_id: { [Op.eq]: app.merchant_id},
        id: { [Op.eq]: app.user_id},
    })

    try {
        const user = await tUser.findOne({
            attributes: { exclude: ['created_on', 'modified_on', 'deleted', 'password'] },
            where: whereClause(),
        })
        if (!user) {
            const response = RESPONSE.error('unknown')
            response.error_message = `Pengguna tidak ditemukan.`
            return res.status(400).json(response)
        }

        const response = RESPONSE.default
        response.data  = user
        return res.status(200).json(response)   
    } catch (err) {
        console.log(err)
        const response = RESPONSE.error('unknown')
        response.error_message = err.message || catchMessage
        return res.status(500).json(response)
    }
}

//http://www.mysqltutorial.org/mysql-nodejs/
//https://webapplog.com/handlebars/
