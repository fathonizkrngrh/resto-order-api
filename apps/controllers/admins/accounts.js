/* jshint indent: 2 */
"use strict";
const { Op } = require("sequelize");
const UTILITIES = require("../../utilities");
const CONFIG = require('../../config')
const model = require("../../models/mysql")
const seq = model.sequelize
const tAccount = model.accounts
const tMerchant = model.merchants

module.exports = {
  viewAccount: async (req, res) => {
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = {
      message: alertMessage,
      status: alertStatus,
    };

    const { user, merchant } = req.app.locals;

    const whereClause = (user) => ({
      deleted: { [Op.eq]: 0 }
    })

    try {
      const accounts = await tAccount.findAll({
        raw: true, attributes: { exclude: ['created_on', 'modified_on', 'deleted', 'password'] },
        order: [['id', 'DESC' ]], where: whereClause(user),
      })
      const merchants = await tMerchant.findAll({
        raw: true, attributes: { exclude: ['created_on', 'modified_on', 'deleted'] },
        order: [['id', 'DESC' ]], where: whereClause(user),
      })

      console.log(accounts)

      const title = "RestoOrder | Account";
      return res.render("admin/account/viewAccount", {
        ...req.app.locals,
        action: 'view',
        merchant,
        merchants,
        accounts,
        alert,
        title,
      });
    } catch (err) { 
      console.log(err)
      return res.redirect("/admin/account");
    }
  },

  addAccount: async (req, res) => {
    const { user } = req.app.locals;
    let {
        role, username, name, phone, email, password, merchant_id
    } = req.body

    console.log(req.body)
    const requiredAttributes = { username: "Username", name: "Name", role: "Role", email: 'Email', phone: 'Phone', password: 'Password', merchant_id: 'Merchant' }
    for (const key of Object.keys(requiredAttributes)) {
        if (!req.body[key]) {
            req.flash("alertMessage",`${requiredAttributes[key]} is Required.`);
            req.flash("alertStatus", "danger");
            return res.redirect("/admin/account");
        }
    }
    
    phone = UTILITIES.parsePhoneNumber(phone)
    const passwordHash = require('crypto').createHash('sha1').update(`${password.trim()}${CONFIG.password_key_encrypt}`).digest('hex')
    
    const checkAccount = await tAccount.findOne({
        raw: true,
        where: {
            merchant_id: { [Op.eq]:  merchant_id},
            email: { [Op.eq]: email },
            phone: { [Op.eq]: phone },
            deleted: { [Op.eq]: 0 }
        }
    })
    if (checkAccount && checkAccount.email.toLowerCase() === email.toLowerCase()) {
      req.flash("alertMessage",`Email/Phone already registered`);
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/account");
    }

    try {
      await tAccount.create({ role, username, name, phone, email, password: passwordHash, merchant_id })
        
      req.flash("alertMessage", "success add account");
      req.flash("alertStatus", "success");
      res.redirect("/admin/account");
    } catch (err) {
      console.log(err);
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/account");
    }
  },

  showEditAccount: async (req, res) => {
    const { user } = req.app.locals;
    const { id } = req.params;

    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = {
      message: alertMessage,
      status: alertStatus,
    };

    try {
      const account = await tAccount.findOne({ raw: true, 
        attributes: { exclude: ['created_on', 'deleted', 'modified_on'] },
        where: { id: {[Op.eq]: id }, deleted: {[Op.eq]: 0 } }
      })
      if (!account) {
        req.flash("alertMessage", `Account not found`);
        req.flash("alertStatus", "danger");
        return res.redirect("/admin/account");
      }

      res.render("admin/account/viewAccount", {
        account,
        alert,
        title : "RestoOrder | Edit Account",
        action: "edit",
      });
    } catch (err) {
      console.log(err);
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/account");
    }
  },

  editAccount: async (req, res) => {
    const { user } = req.app.locals;
    const body = req.body;

    if (!body.id ) {
      req.flash("alertMessage", `Incomplete Request`);
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/account");
    }

    try {
      const account = await tAccount.findOne({ 
        attributes: { exclude: ['created_on', 'deleted', 'modified_on'] },
        where: {
          id: { [Op.eq]: body.id }, 
          deleted: { [Op.eq]: 0 } }
      })
      if (!account) {
          req.flash("alertMessage", `Account not found`)
          req.flash("alertStatus", "danger")
          return res.redirect("/admin/account")
      }

      if (body.type === "cook") body.stock = 0 
        
      await tAccount.update({...body}, { where: { id: { [Op.eq]: body.id }, deleted: { [Op.eq]: 0 } }});

      if (req.file) {
        await destroy(account.logo).then(async () => {
          await upload(req.file.path, `${account.package_name.replace(/\./g, '_')}/images/accounts`).then(async (result)=> {
            console.log(result)
            await tAccount.update({ logo: result.secure_url}, {where: {id: {[Op.eq]: body.id }}})
          })
        })
      }

      req.flash("alertMessage", "success update account");
      req.flash("alertStatus", "success");
      return res.redirect("/admin/account");
    } catch (err) {
      console.log(err);
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/account");
    }
  },

  deleteaccount: async (req, res) => {
    const { user } = req.app.locals;
    const { id } = req.params;

    const account = await tAccount.findOne({ 
      attributes: { exclude: ['created_on', 'deleted', 'modified_on',] },
      where: {
        id: { [Op.eq]: id }, 
        deleted: { [Op.eq]: 0 } }
    })
    if (!account) {
        req.flash("alertMessage", `Account not found`)
        req.flash("alertStatus", "danger")
        return res.redirect("/admin/account")
    }

    try {
      await tAccount.update({ deleted: 1}, { 
        where: {
            id: { [Op.eq]: id }, 
            deleted: { [Op.eq]: 0 } 
        }
      })

      req.flash("alertMessage", "success delete account");
      req.flash("alertStatus", "success");
      res.redirect("/admin/account");
    } catch (err) {
      console.log(err);
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/account");
    }
  },

  updateStatus: async (req, res) => {
    const { user } = req.app.locals;
    const { id } = req.body;

    console.log(req.body);

    const account = await tAccount.findOne({ 
      raw: true, attributes: { exclude: ['created_on', 'deleted', 'modified_on',] },
      where: {
        id: { [Op.eq]: id }, 
        deleted: { [Op.eq]: 0 } }
    })
    if (!account) {
        req.flash("alertMessage", `Account not found`)
        req.flash("alertStatus", "danger")
        return res.redirect("/admin/account")
    }

    console.log(account)

    try {
      await tAccount.update({ 
        active: account.active == false ? 1 : 0 
      }, { 
        where: {
            id: { [Op.eq]: id }, 
            deleted: { [Op.eq]: 0 } 
        }
      })

      req.flash("alertMessage", "success change status account");
      req.flash("alertStatus", "success");
      res.redirect("/admin/account");
    } catch (err) {
      console.log(err);
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/account");
    }
  },
};
