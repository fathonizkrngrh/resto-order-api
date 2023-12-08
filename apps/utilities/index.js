"use state"
const crypto = require('crypto');
const bcrypt = require('bcrypt');

module.exports.generateRandomNumber = (length) => {
    let result = '';
    let characters = '012345678901234567890123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports.generateRandomString = (length) => {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports.parsePhoneNumber = (phone) => {
    phone = phone.trim()
    phone = phone.replace(/-/g, '')
    phone = phone.replace(/ /g, '')
    phone = phone.replace(/\+/g, '')
    if (phone.substr(0, 1) == '0') { phone = '62' + phone.substr(1, phone.length - 1) }
    else if (phone.substr(0, 3) == '+62') { phone = '62' + phone.substr(3, phone.length - 1) }
    return phone
}

module.exports.generateOAuthUsername = (name) => {
    const replacedUsername = name.replace(/\s+/g, '-').toLowerCase();
    const randomString = crypto.randomBytes(2).toString('hex');
    return `${replacedUsername}-${randomString}`;
},
    
module.exports.generateOAuthPassword = async (email) => {
    const randomString = crypto.randomBytes(2).toString('hex');
    return crypto.createHash('sha1').update(`${email.trim()}${CONFIG.password_key_encrypt}${randomString}`).digest('hex')
}
  