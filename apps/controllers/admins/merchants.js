/* jshint indent: 2 */
"use strict";
const { Op } = require("sequelize");
const model = require("../../models/mysql")
const seq = model.sequelize
const tMerchant = model.merchants
const cloudinary = require("../../config/cloudinary");
const { upload, destroy } = require("../../utilities/cloudinary");

module.exports = {
  viewMerchant: async (req, res) => {
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
      const merchants = await tMerchant.findAll({
        raw: true, attributes: { exclude: ['created_on', 'modified_on', 'deleted'] },
        order: [['id', 'DESC' ]], where: whereClause(user),
      })

      console.log(merchants)
      const title = "RestoOrder | Merchant";
      return res.render("admin/merchant/viewMerchant", {
        ...req.app.locals,
        action: 'view',
        merchant,
        merchants,
        alert,
        title,
      });
    } catch (err) { 
      console.log(err)
      return res.redirect("/admin/merchant");
    }
  },

  addMerchant: async (req, res) => {
    const { user } = req.app.locals;
    const body = req.body
    
    if (!body.name || !body.package_name || !body.location) {
      req.flash("alertMessage", `Permintaan tidak lengkap`);
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/merchant");
    }
    
    const merchant = await tMerchant.findOne({ raw: true, 
      attributes: { exclude: ['created_on', 'deleted', 'modified_on'] },
      where: { package_name: {[Op.eq]: body.package_name }, deleted: {[Op.eq]: 0 } }
    })
    if (merchant) {
      req.flash("alertMessage", `Package Name Already Exist`);
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/merchant");
    }

    try {
      const merchant = await tMerchant.create({
        name: body.name,
        package_name: body.package_name,
        location: body.location,
        facebook: body?.facebook,
        instagram: body?.instagram,
        active: body?.active || 1,
      })

      if (req.file?.path) {
        await upload(req.file?.path, `${user.merchant_id.replace(/\./g, '_')}/images/merchants`).then(async (logo) => {
            await tMerchant.update({ logo: logo.secure_url}, {where: {id: {[Op.eq]: merchant.id }}})
          })
          .catch((error) => {
            req.flash("alertMessage", `${error}`);
            req.flash("alertStatus", "danger");
            return res.redirect("/admin/merchant");
        });
      }

      req.flash("alertMessage", "success add merchant");
      req.flash("alertStatus", "success");
      res.redirect("/admin/merchant");
    } catch (err) {
      console.log(err);
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/merchant");
    }
  },

  showEditMerchant: async (req, res) => {
    const { user } = req.app.locals;
    const { id } = req.params;

    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = {
      message: alertMessage,
      status: alertStatus,
    };

    try {
      const merchant = await tMerchant.findOne({ raw: true, 
        attributes: { exclude: ['created_on', 'deleted', 'modified_on'] },
        where: { id: {[Op.eq]: id }, deleted: {[Op.eq]: 0 } }
      })
      if (!merchant) {
        req.flash("alertMessage", `Merchant not found`);
        req.flash("alertStatus", "danger");
        return res.redirect("/admin/merchant");
      }

      res.render("admin/merchant/viewMerchant", {
        merchant,
        alert,
        title : "RestoOrder | Edit Merchant",
        action: "edit",
      });
    } catch (err) {
      console.log(err);
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/merchant");
    }
  },

  editMerchant: async (req, res) => {
    const { user } = req.app.locals;
    const body = req.body;

    if (!body.id ) {
      req.flash("alertMessage", `Incomplete Request`);
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/merchant");
    }

    try {
      const merchant = await tMerchant.findOne({ 
        attributes: { exclude: ['created_on', 'deleted', 'modified_on'] },
        where: {
          id: { [Op.eq]: body.id }, 
          deleted: { [Op.eq]: 0 } }
      })
      if (!merchant) {
          req.flash("alertMessage", `Merchant not found`)
          req.flash("alertStatus", "danger")
          return res.redirect("/admin/merchant")
      }

      if (body.type === "cook") body.stock = 0 
        
      await tMerchant.update({...body}, { where: { id: { [Op.eq]: body.id }, deleted: { [Op.eq]: 0 } }});

      if (req.file) {
        await destroy(merchant.logo).then(async () => {
          await upload(req.file.path, `${merchant.package_name.replace(/\./g, '_')}/images/merchants`).then(async (result)=> {
            console.log(result)
            await tMerchant.update({ logo: result.secure_url}, {where: {id: {[Op.eq]: body.id }}})
          })
        })
      }

      req.flash("alertMessage", "success update merchant");
      req.flash("alertStatus", "success");
      return res.redirect("/admin/merchant");
    } catch (err) {
      console.log(err);
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/merchant");
    }
  },

  deletemerchant: async (req, res) => {
    const { user } = req.app.locals;
    const { id } = req.params;

    const merchant = await tMerchant.findOne({ 
      attributes: { exclude: ['created_on', 'deleted', 'modified_on',] },
      where: {
        id: { [Op.eq]: id }, 
        deleted: { [Op.eq]: 0 } }
    })
    if (!merchant) {
        req.flash("alertMessage", `Merchant not found`)
        req.flash("alertStatus", "danger")
        return res.redirect("/admin/merchant")
    }

    try {
      await tMerchant.update({ deleted: 1}, { 
        where: {
            id: { [Op.eq]: id }, 
            deleted: { [Op.eq]: 0 } 
        }
      })

      req.flash("alertMessage", "success delete merchant");
      req.flash("alertStatus", "success");
      res.redirect("/admin/merchant");
    } catch (err) {
      console.log(err);
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/merchant");
    }
  },

  updateStatus: async (req, res) => {
    const { user } = req.app.locals;
    const { id } = req.body;

    console.log(req.body);

    const merchant = await tMerchant.findOne({ 
      raw: true, attributes: { exclude: ['created_on', 'deleted', 'modified_on',] },
      where: {
        id: { [Op.eq]: id }, 
        deleted: { [Op.eq]: 0 } }
    })
    if (!merchant) {
        req.flash("alertMessage", `Merchant not found`)
        req.flash("alertStatus", "danger")
        return res.redirect("/admin/merchant")
    }

    console.log(merchant)

    try {
      await tMerchant.update({ 
        active: merchant.active == false ? 1 : 0 
      }, { 
        where: {
            id: { [Op.eq]: id }, 
            deleted: { [Op.eq]: 0 } 
        }
      })

      req.flash("alertMessage", "success change status merchant");
      req.flash("alertStatus", "success");
      res.redirect("/admin/merchant");
    } catch (err) {
      console.log(err);
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/merchant");
    }
  },
};
