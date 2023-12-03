const { Op } = require("sequelize");
const model = require("../../models/mysql")
const tCategory =model.categories
const tProduct =model.products
const tMerchant =model.merchants

module.exports = {
  viewDashboard: async (req, res) => {
    try {
      const { user, merchant } = req.app.locals;

      const where = () => ({ 
        ...user.merchant_id && {
          merchant_id: { [Op.eq]: user.merchant_id }
        },
        deleted: { [Op.eq]: 0 },
      })

      const total = {
        ...user.role === 'superadmin' && { merchant: await tMerchant.count({ where: { deleted: { [Op.eq]: 0 },} })},
        category: await tCategory.count({ where: where() }),
        product: await tProduct.count({ where: where() }),
      }

      let merchants
      if (user.role === 'superadmin') {
          merchants = await tMerchant.findAll({where: { deleted: { [Op.eq]: 0 }}, attributes: ['id', 'package_name', 'name']})
      }
      
      res.render("index", {
        total,
        title: "RestoOrder | Dashboard",
        user,
        merchant,
        merchants: merchants || null
      });
    } catch (err) {
      res.render("error", {
        err,
      });
    }
  },

  changeMerchant: async (req, res) => {
    const { user, merchant } = req.app.locals;
    const session = req.session.user
    const { id } = req.params
    try {

      console.log("session sebelum", session)
      session.merchant_id = id
      console.log("session change merchant", session)

      res.redirect("/admin/");
    } catch (err) {
      console.log(err);
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/account");
    }
  },
};
