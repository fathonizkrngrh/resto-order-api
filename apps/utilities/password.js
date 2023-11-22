"use strict";

const bcryptjs = require("bcryptjs");

module.exports = {
  hash: async (password) => {
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    return hashedPassword;
  },
  compare: async (password, hashedPassword) => {
    const isPasswordMatch = await bcryptjs.compare(password, hashedPassword);
    return isPasswordMatch;
  },
};
