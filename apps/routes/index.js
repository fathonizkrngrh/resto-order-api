"use strict";

const express = require("express");
//CONTROLLERS
const controller = require("../controllers");
const cAuthAdmin = require("../controllers/auth");
const cAuthUser = require("../controllers/user_auth");
const cCategory = require("../controllers/categories");
const cProduct = require("../controllers/products");
const cMerchant = require("../controllers/merchants");
const cCart = require("../controllers/carts");

//ROUTINGS
module.exports = (app) => {
  app.get("/", (req, res) => controller.default(req, res));

  const adminAuthRouter = express.Router()
  app.use('/admin', adminAuthRouter)
  adminAuthRouter.post("/signin", (req, res) => cAuthAdmin.signin(req, res));
  adminAuthRouter.post("/register", (req, res) => cAuthAdmin.register(req, res));

  const clientAuthRouter = express.Router()
  app.use('/user', clientAuthRouter)
  clientAuthRouter.post("/signin", (req, res) => cAuthUser.signin(req, res));
  clientAuthRouter.post("/register", (req, res) => cAuthUser.register(req, res));

  const merchantRouter = express.Router()
  app.use('/merchant', merchantRouter)
  merchantRouter.get("/list", (req, res) => cMerchant.list(req, res));
  merchantRouter.get("/", (req, res) => cMerchant.detail(req, res));
  merchantRouter.post("/", (req, res) => cMerchant.create(req, res));
  merchantRouter.patch("/", (req, res) => cMerchant.update(req, res));
  merchantRouter.patch("/", (req, res) => cMerchant.delete(req, res));
  
  const categoryRouter = express.Router()
  app.use('/category', categoryRouter)
  categoryRouter.get("/list", (req, res) => cCategory.list(req, res));
  categoryRouter.get("/", (req, res) => cCategory.detail(req, res));
  categoryRouter.post("/", (req, res) => cCategory.create(req, res));
  categoryRouter.patch("/", (req, res) => cCategory.update(req, res));
  categoryRouter.patch("/", (req, res) => cCategory.delete(req, res));

  const productRouter = express.Router()
  app.use('/product', productRouter)
  productRouter.get("/list", (req, res) => cProduct.list(req, res));
  productRouter.get("/", (req, res) => cProduct.detail(req, res));
  productRouter.post("/", (req, res) => cProduct.create(req, res));
  productRouter.patch("/", (req, res) => cProduct.update(req, res));
  productRouter.patch("/", (req, res) => cProduct.delete(req, res));

  const cartRouter = express.Router()
  app.use('/cart', cartRouter)
  cartRouter.get("/list", (req, res) => cCart.list(req, res));
  cartRouter.post("/", (req, res) => cCart.add_to_cart(req, res));
  cartRouter.patch("/", (req, res) => cCart.delete(req, res));
};
