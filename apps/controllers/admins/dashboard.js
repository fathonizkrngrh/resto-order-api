const { Op } = require("sequelize");
const model = require("../../models/mysql")
const tCategory =model.categories
const tProduct =model.products
const tMerchant =model.merchants

module.exports = {
  viewDashboard: async (req, res) => {
    try {
      const { user, merchant } = req.app.locals;
      console.log("user dari dashboard", user)
      console.log("merchant dari dashboard", merchant)

      const where = () => ({ 
          deleted: { [Op.eq]: 0 },
          ...user.merchant_id && {
              merchant_id: { [Op.eq]: user.merchant_id }
          }
      })

      const total = {
        ...user.role === 'superadmin' && { merchant: await tMerchant.count({ where: where })},
        category: await tCategory.count({ where: where }),
        product: await tProduct.count({ where: where }),

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
};
