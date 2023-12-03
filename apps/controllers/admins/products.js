/* jshint indent: 2 */
"use strict";
const { Op } = require("sequelize");
const model = require("../../models/mysql")
const seq = model.sequelize
const tCategory = model.categories
const tProduct = model.products
const tMerchant = model.merchants
const cloudinary = require("../../config/cloudinary");
const { upload, destroy } = require("../../utilities/cloudinary");

module.exports = {
  viewProduct: async (req, res) => {
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = {
      message: alertMessage,
      status: alertStatus,
    };

    const { user, merchant } = req.app.locals;

    const whereClause = (user) => ({
      deleted: { [Op.eq]: 0 },
      merchant_id: { [Op.eq]: user.merchant_id},
    })

    try {
      const product = await tProduct.findAll({
        raw: true, attributes: { exclude: ['created_on', 'modified_on', 'deleted', 'product_id'] },
        order: [['id', 'DESC' ]], where: whereClause(user),
      })

      const category = await tCategory.findAll({
        raw: true, attributes: { exclude: ['created_on', 'modified_on', 'deleted']},
        order: [['id', 'DESC' ]], where: whereClause(user),
      })

      const title = "RestoOrder | Product";
      return res.render("admin/product/viewProduct", {
        ...req.app.locals,
        action: 'view',
        product,
        category,
        alert,
        title,
      });
    } catch (err) { 
      console.log(err)
      return res.redirect("/admin/product");
    }
  },

  addProduct: async (req, res) => {
    const { user } = req.app.locals;
    const body = req.body
    
    if (!body.name || !body.category_id) {
      req.flash("alertMessage", `Permintaan tidak lengkap`);
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/product");
    }
    
    const category = await tCategory.findOne({ raw: true, where: { merchant_id: { [Op.eq]: user.merchant_id}, id: {[Op.eq]: body.category_id }, deleted: {[Op.eq]: 0 } }})
    if (!category) {
      req.flash("alertMessage", `Category not found`);
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/product");
    }
    
    const countProduct = await tProduct.count({ raw: true, where: {merchant_id: { [Op.eq]: user.merchant_id}, category_id: {[Op.eq]: body.category_id }}})
    const prefix = category.name.match(/[bcdfghjklmnpqrstvwxyz]/gi).join('').toUpperCase();
    const code = prefix.toUpperCase() + `${countProduct+1}`.padStart(3, '0')

    try {
      const product = await tProduct.create({
          merchant_id: user.merchant_id,
          category_id: category.id,
          category_name: category.name,
          name: body.name,
          code: code,
          price: body.price,
          type: body?.type || 'cook',
          stock: body?.stock || 0,
          ready: body.ready || 1,
          point: body.point || 0,
      })

      await upload(req.file.path, `${user.merchant_id.replace(/\./g, '_')}/images/products`).then(async (image) => {
          await tProduct.update({ image: image.secure_url}, {where: {id: {[Op.eq]: product.id }}})
        })
        .catch((error) => {
          req.flash("alertMessage", `${error}`);
          req.flash("alertStatus", "danger");
          return res.redirect("/admin/product");
      });

      req.flash("alertMessage", "success add product");
      req.flash("alertStatus", "success");
      res.redirect("/admin/product");
    } catch (err) {
      console.log(err);
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/product");
    }
  },

  showImageProduct: async (req, res) => {
    const { user } = req.app.locals;
    const { id } = req.params;

    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = {
      message: alertMessage,
      status: alertStatus,
    };

    try {
      const product = await tProduct.findOne({ raw: true, attributes: ['id', 'name', 'image'], where: { merchant_id: { [Op.eq]: user.merchant_id}, id: {[Op.eq]: id }, deleted: {[Op.eq]: 0 } }})
      if (!product) {
        req.flash("alertMessage", `Product not found`);
        req.flash("alertStatus", "danger");
        return res.redirect("/admin/product");
      }

      const title = "RestoOrder | Show Image product";
      res.render("admin/product/viewProduct", {
        product,
        alert,
        title,
        action: "show image",
      });
    } catch (err) {
      console.log(err);
      res.redirect("/admin/product");
    }
  },

  showEditProduct: async (req, res) => {
    const { user } = req.app.locals;
    const { id } = req.params;

    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = {
      message: alertMessage,
      status: alertStatus,
    };

    const whereClause = (user) => ({
      deleted: { [Op.eq]: 0 },
      merchant_id: { [Op.eq]: user.merchant_id},
    })
    
    try {
      const product = await tProduct.findOne({ raw: true, 
        attributes: { exclude: ['created_on', 'deleted', 'modified_on', 'product_id'] },
        where: { merchant_id: { [Op.eq]: user.merchant_id}, id: {[Op.eq]: id }, deleted: {[Op.eq]: 0 } }
      })
      if (!product) {
        req.flash("alertMessage", `Product not found`);
        req.flash("alertStatus", "danger");
        return res.redirect("/admin/product");
      }
      
      const category = await tCategory.findAll({
        raw: true, attributes: { exclude: ['created_on', 'modified_on', 'deleted']},
        order: [['id', 'DESC' ]], where: whereClause(user),
      })

      res.render("admin/product/viewProduct", {
        product,
        alert,
        category,
        title : "RestoOrder | Edit Product",
        action: "edit",
      });
    } catch (err) {
      console.log(err);
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/product");
    }
  },

  editProduct: async (req, res) => {
    const { user } = req.app.locals;
    const body = req.body;
    console.log(body)
    console.log(user)

    if (!body.id ) {
      req.flash("alertMessage", `Incomplete Request`);
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/product");
    }

    if (body.category_id) {
      const category = await tCategory.findOne({ where: { 
          merchant_id: { [Op.eq]: user.merchant_id},
          id: {[Op.eq]: body.category_id }, 
          deleted: {[Op.eq]: 0 } }
      })
      if (!category) {
          req.flash("alertMessage", `Category not found`);
          req.flash("alertStatus", "danger");
          return res.redirect("/admin/product");
      }     
    }

    try {
      const product = await tProduct.findOne({ 
        attributes: { exclude: ['created_on', 'deleted', 'modified_on', 'product_id'] },
        where: {
          merchant_id: { [Op.eq]: user.merchant_id}, 
          id: { [Op.eq]: body.id }, 
          deleted: { [Op.eq]: 0 } }
      })
      if (!product) {
          req.flash("alertMessage", `Product not found`)
          req.flash("alertStatus", "danger")
          return res.redirect("/admin/product")
      }

      if (body.type === "cook") body.stock = 0 
        
      await tProduct.update({...body}, { where: { merchant_id: { [Op.eq]: user.merchant_id }, id: { [Op.eq]: body.id }, deleted: { [Op.eq]: 0 } }});

      if (req.file) {
        await destroy(product.image).then(async () => {
          await upload(req.file.path, `${user.merchant_id.replace(/\./g, '_')}/images/products`).then(async (result)=> {
            console.log(result)
            await tProduct.update({ image: result.secure_url}, {where: {id: {[Op.eq]: body.id }}})
          })
        })

      }

      req.flash("alertMessage", "success update product");
      req.flash("alertStatus", "success");
      return res.redirect("/admin/product");
    } catch (err) {
      console.log(err);
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/product");
    }
  },

  deleteproduct: async (req, res) => {
    const { user } = req.app.locals;
    const { id } = req.params;
    try {
      await tProduct.update({ deleted: 1}, { 
        where: {
            merchant_id: { [Op.eq]: user.merchant_id },
            id: { [Op.eq]: id }, 
            deleted: { [Op.eq]: 0 } 
        }
      })

      req.flash("alertMessage", "success delete product");
      req.flash("alertStatus", "success");
      res.redirect("/admin/product");
    } catch (err) {
      console.log(err);
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/product");
    }
  },
};
