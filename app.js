"use strict";
const CONFIG = require("./apps/config");
const RESPONSE = require("./apps/utilities/response");
// EXPRESS
const session = require("express-session");
const methodOverride = require("method-override");
const connectRedis = require('connect-redis');
const cors = require("cors");
const path = require("path");
const flash = require("connect-flash");
const express = require("express");
const app = express();

// LOGGER FOR DEV
const logger = require("morgan");
if (CONFIG.env === "development") {
  app.use(logger("dev"));
}


app.use(cors({origin: '*'}));
app.use(methodOverride("_method"));

// view engine setup
app.set("views", path.join(__dirname, "./apps/views"));
app.set("view engine", "ejs");
app.set("trust proxy", 1); // trust first proxy
app.use(express.static(path.join(__dirname, "./public")));
app.use(
  "/sb-admin-2",
  express.static(
    path.join(__dirname, "./node_modules/startbootstrap-sb-admin-2")
  )
);

// redis
const RedisStore = connectRedis(session)
const redisClient = require('./apps/models/redis')

// I/O
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const oneDay = 1000 * 60 * 60 * 24;
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: "secretsession",
    resave: false,
    saveUninitialized: false,
    cookie: { expires: false, maxAge: oneDay, secure: false, httpOnly: false },
  })
);
app.use(flash());

app.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});


// MODELS
app.models = {};
app.models.mysql = require("./apps/models/mysql");
app.models.buffer= require('./apps/models/redis')
// CONTROLLERS ROUTE
app.routes = require("./apps/routes")(app);

// catch 404 and forward to error handler
app.use((req, res) => {
    const response = RESPONSE.error('unknown')
    response.error_message = 'Resource not found.'
    return res.status(404).json(response)
  }
);

app.listen(CONFIG.port, () => {
  console.info(`======= Server is running on http://localhost:${CONFIG.port} =======`);
});

module.exports = app;
