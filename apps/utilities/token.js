const jwt = require("jsonwebtoken");
const CONFIG = require("../config");

module.exports = {
  generateToken: (user) => { 
    console.log(user)
    const payload = {
      user_id: user.user_id,
      merchant_id: user.merchant_id
    }
    return jwt.sign(payload, CONFIG.jwt_encryption, { expiresIn: "1d"})
  },
  verifyToken: (token) => jwt.verify(token, CONFIG.jwt_encryption),
};
