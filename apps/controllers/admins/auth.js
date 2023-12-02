"use strict";
const Op = require('sequelize').Op
const Pagination = require("../../utilities/pagination");
const RESPONSE = require("../../utilities/response");
const UTILITIES = require("../../utilities");
const CONFIG = require('../../config')
const model = require("../../models/mysql")
const tAccount = model.accounts

module.exports.signin = async (req, res) => {
    const { phonemail, password } = req.body

    if ((!phonemail || !password)) {
        req.flash("alertMessage", 'Permintaan tidak lengkap. Masukkan Email atau No. Handphone dan Password');
        req.flash("alertStatus", "danger");
        return res.redirect("/admin/signin");
    }

    try {
        const account = await tAccount.findOne({
            raw: true,
            where: { 
                deleted: { [Op.eq]: 0 }, 
                [Op.or]: {
                    phone: { [Op.like]: `%${UTILITIES.parsePhoneNumber(phonemail)}%` },
                    email: { [Op.like]: `%${phonemail}%` },
                }   
            }
        })
        if (!account) {
            req.flash("alertMessage", 'Akun tidak terdaftar.');
            req.flash("alertStatus", "danger");
            return res.redirect("/admin/signin");
        }

        const hashed = require('crypto').createHash('sha1').update(`${password.trim()}${CONFIG.password_key_encrypt}`).digest('hex')
        if (hashed !== account.password) {
            req.flash("alertMessage", 'Kombinasi password dan email salah.');
            req.flash("alertStatus", "danger");
            return res.redirect("/admin/signin");
        }

        if (account.role !== 'admin' && account.role !== 'superadmin') {
            req.flash("alertMessage", 'Akses ditolak.');
            req.flash("alertStatus", "danger");
            return res.redirect("/admin/signin");
        }

        let session = req.session;
        session.user = {
            id: account.id,
            phone: account.phone,
            merchant_id: account.merchant_id,
            email: account.email,
            username: account.username,
            role: account.role,
            staff_id: account?.staff_id || null,
        };
        console.log(req.session)

        return res.redirect("/admin/");
    } catch (error) {
        res.redirect("/admin/category");
    }
};

module.exports.signinPage = async (req, res) => {
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = {
        message: alertMessage,
        status: alertStatus,
    };
    try {
      res.render("admin/auth/signin", {
        title: "RestoOrder | Dashboard",
        alert
      });
    } catch (err) {
      res.render("error", {
        err,
      });
    }
}
