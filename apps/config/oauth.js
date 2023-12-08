const CONFIG = require('./index')
const { OAuth2Client } = require("google-auth-library");

module.exports.google = new OAuth2Client(
  CONFIG.google_client_id,
  CONFIG.google_client_secret,
  CONFIG.google_redirect_uri,
)