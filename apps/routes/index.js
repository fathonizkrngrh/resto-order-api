"use strict";
const RESPONSE = require("../utilities/response")
const express = require("express");
//  Middleware
const middleware = require("../middlewares")
const multer = require("../middlewares/multer")
//CONTROLLERS
const controller = require("../controllers/apis");
const cAuthUser = require("../controllers/apis/auth");
const cCategory = require("../controllers/apis/categories");
const cProduct = require("../controllers/apis/products");
const cCart = require("../controllers/apis/carts");
const cTransaction = require("../controllers/apis/transactions");
const cRank = require("../controllers/apis/user_ranks");
// ADMIN CONTROLLERS
const cDashboard = require("../controllers/admins/dashboard");
const cAdminCategory = require("../controllers/admins/categories");
const cAdminOrder = require("../controllers/admins/orders");
const cAdminProduct = require("../controllers/admins/products");
const cAdminMerchant = require("../controllers/admins/merchants");
const cAdminAccount = require("../controllers/admins/accounts");
const cAuth = require("../controllers/admins/auth");

//ROUTINGS
module.exports = (app) => {
  app.get("/", (req, res) => controller.default(req, res));

  const adminAuthRouter = express.Router()
  app.use('/admin', adminAuthRouter)
  adminAuthRouter.get("/signin", (req, res) => cAuth.signinPage(req, res));
  adminAuthRouter.post("/signin", (req, res) => cAuth.signin(req, res));
  adminAuthRouter.get("/signout", (req, res) => cAuth.signout(req, res));

  const adminRouter = express.Router()
  app.use('/admin', middleware.checkAdmin, adminRouter)
  adminRouter.get("/", (req, res) => cDashboard.viewDashboard(req, res));
  adminRouter.get("/change_merchant/:id", (req, res) => cDashboard.changeMerchant(req, res));
  // category
  adminRouter.get("/category", (req, res) => cAdminCategory.viewCategory(req, res));
  adminRouter.post("/category", (req, res) => cAdminCategory.addCategory(req, res));
  adminRouter.put("/category", (req, res) => cAdminCategory.editCategory(req, res));
  adminRouter.delete("/category/:id", (req, res) => cAdminCategory.deleteCategory(req, res));
  // category
  adminRouter.get("/order", (req, res) => cAdminOrder.viewOrder(req, res));
  adminRouter.post("/order/approve", (req, res) => cAdminOrder.approveOrder(req, res));
  adminRouter.post("/order/paid", (req, res) => cAdminOrder.paid(req, res));
  // product
  adminRouter.get("/product", (req, res) => cAdminProduct.viewProduct(req, res));
  adminRouter.get("/product/show-image/:id", (req, res) => cAdminProduct.showImageProduct(req, res));
  adminRouter.get("/product/:id", (req, res) => cAdminProduct.showEditProduct(req, res));
  adminRouter.post("/product", multer.upload ,(req, res) => cAdminProduct.addProduct(req, res));
  adminRouter.post("/product/edit", multer.upload ,(req, res) => cAdminProduct.editProduct(req, res));
  adminRouter.delete("/product/:id", (req, res) => cAdminProduct.deleteproduct(req, res));
  // merchant
  adminRouter.get("/merchant", (req, res) => cAdminMerchant.viewMerchant(req, res));
  adminRouter.get("/merchant/:id", (req, res) => cAdminMerchant.showEditMerchant(req, res));
  adminRouter.post("/merchant", multer.upload ,(req, res) => cAdminMerchant.addMerchant(req, res));
  adminRouter.post("/merchant/edit", multer.upload ,(req, res) => cAdminMerchant.editMerchant(req, res));
  adminRouter.post("/merchant/status", (req, res) => cAdminMerchant.updateStatus(req, res));
  adminRouter.delete("/merchant/:id", (req, res) => cAdminMerchant.deletemerchant(req, res));
  // account
  adminRouter.get("/account", middleware.checkSuperAdmin, (req, res) => cAdminAccount.viewAccount(req, res));
  adminRouter.get("/account/:id", middleware.checkSuperAdmin, (req, res) => cAdminAccount.showEditAccount(req, res));
  adminRouter.post("/account", middleware.checkSuperAdmin, (req, res) => cAdminAccount.addAccount(req, res));
  adminRouter.post("/account/edit", middleware.checkSuperAdmin, (req, res) => cAdminAccount.editAccount(req, res));
  adminRouter.delete("/account/:id", middleware.checkSuperAdmin, (req, res) => cAdminAccount.deletemerchant(req, res));
  
  // Api Router
  const apiRouter = express.Router()
  app.use('/api', apiRouter)
  apiRouter.post("/user/signin", (req, res) => cAuthUser.signin(req, res));
  apiRouter.post("/user/signup", (req, res) => cAuthUser.signup(req, res));
  apiRouter.post("/user/google_callback", (req, res) => cAuthUser.google_callback(req, res));
  apiRouter.get("/user/me", middleware.authentication, (req, res) => cAuthUser.me(req, res));

  apiRouter.get("/rank/list", middleware.authentication, (req, res) => cRank.rank(req, res));
  
  apiRouter.get("/product/category/list", middleware.authentication, (req, res) => cCategory.list(req, res));
  apiRouter.get("/product/list", middleware.authentication, (req, res) => cProduct.list(req, res));
  apiRouter.get("/product/list/top_seller", middleware.authentication, (req, res) => cProduct.top_seler(req, res));
  apiRouter.get("/product/list/reward", middleware.authentication, (req, res) => cProduct.rewards(req, res));
  apiRouter.post("/product/add_to_cart", middleware.authentication, (req, res) => cCart.add_to_cart(req, res));

  apiRouter.get("/cart/list", middleware.authentication, (req, res) => cCart.list(req, res));
  apiRouter.get("/cart/count", middleware.authentication, (req, res) => cCart.count(req, res));
  apiRouter.delete("/cart/delete", middleware.authentication, (req, res) => cCart.delete(req, res));
  
  apiRouter.post("/transaction/order", middleware.authentication, (req, res) => cTransaction.checkout(req, res));
  apiRouter.get("/transaction/list", middleware.authentication, (req, res) => cTransaction.list(req, res));
  apiRouter.post("/transaction/status", middleware.authentication, (req, res) => cTransaction.check_status(req, res));

  const cartRouter = express.Router()
  app.use('/cart', cartRouter)
  cartRouter.get("/list", (req, res) => cCart.list(req, res));
  cartRouter.post("/", (req, res) => cCart.add_to_cart(req, res));
  cartRouter.patch("/", (req, res) => cCart.delete(req, res));

  // catch 404 and forward to error handler
  app.use((req, res) => {
    const response = RESPONSE.error('unknown')
    response.error_message = 'Resource not found.'
    return res.status(404).json(response)
  }
  );
};
