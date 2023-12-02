const { Op } = require("sequelize");
const model = require("../../models/mysql")
const seq =model.sequelize
const tCategory =model.categories
const tProduct =model.products
const tMerchant =model.merchants

module.exports = {
  viewCategory: async (req, res) => {
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = {
      message: alertMessage,
      status: alertStatus,
    };

    const { user } = req.app.locals;

    const whereClause = (user) => ({
      deleted: { [Op.eq]: 0 },
      merchant_id: { [Op.eq]: user.merchant_id},
    })

    try {
      const category = await tCategory.findAll({
        raw: true,
        attributes: { 
          include: [ [seq.literal(`( SELECT COUNT(*) FROM products WHERE products.category_id = categories.id AND products.deleted = 0)`), 'total_product']],
          exclude: ['created_on', 'modified_on', 'deleted'] 
        },
        where: whereClause(user),
      })

      console.log(category)
      const title = "RestoOrder | Category";
      return res.render("admin/category/viewCategory", {
        ...req.app.locals,
        category,
        alert,
        title,
      });
    } catch (err) {
      console.log(err)
      return res.redirect("/admin/category");
    }
  },
  addCategory: async (req, res) => {
    try {
      const { user } = req.app.locals;
      const body = req.body

      if (!body.name ) {
          req.flash("alertMessage", `Permintaan tidak lengkap`);
          req.flash("alertStatus", "danger");
          res.redirect("/admin/category");
      }

      await tCategory.create({
        merchant_id: user.merchant_id,
        name: body.name, 
        icon: body?.icon, 
      });

      req.flash("alertMessage", "success add category");
      req.flash("alertStatus", "success");
      res.redirect("/admin/category");
    } catch (err) {
      console.log(err);
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/category");
    }
  },
  editCategory: async (req, res) => {
    const { user } = req.app.locals;
    const body = req.body;

    try {
      await tCategory.update({
        ...req.body 
      }, {
        where: {
          merchant_id: { [Op.eq]: user.merchant_id },
          id: { [Op.eq]: body.id }, 
          deleted: { [Op.eq]: 0 } 
        }
      });

      req.flash("alertMessage", "success edit category");
      req.flash("alertStatus", "success");
      return res.redirect("/admin/category");
    } catch (err) {
      console.log(err);
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/category");
    }
  },
  deleteCategory: async (req, res) => {
    const { user } = req.app.locals;
    const { id } = req.params;
    try {
      await tCategory.update({ deleted: 1}, { 
        where: {
            merchant_id: { [Op.eq]: user.merchant_id },
            id: { [Op.eq]: id }, 
            deleted: { [Op.eq]: 0 } 
        }
      })

      req.flash("alertMessage", "success delete category");
      req.flash("alertStatus", "success");
      res.redirect("/admin/category");
    } catch (err) {
      console.log(err);
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/category");
    }
  },
};
