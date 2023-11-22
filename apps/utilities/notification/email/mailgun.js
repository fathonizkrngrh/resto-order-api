"use strict"
const nodemailer = require('nodemailer')
const mailgun    = require('mailgun-js')
const MG_DOMAIN  = { nuku: 'mail.nuku.my.id', madrasahqu: 'mail.madrasahqu.id' }
const MG_API_KEY = { nuku: '6fcfd5f5d42613d7856a62a2f48c1e2c-9b1bf5d3-2184acf5', madrasahqu: '6fcfd5f5d42613d7856a62a2f48c1e2c-9b1bf5d3-2184acf5' }
const MG_API_URL = { nuku: 'https://api.mailgun.net/v3/mail.nuku.my.id', madrasahqu: 'https://api.mailgun.net/v3/mail.madrasahqu.id' }
 
module.exports.sending_email_via_smtp = (data) => {
    const transport = nodemailer.createTransport({
        host: 'smtp.mailgun.org', port: 587, auth: { user: 'postmaster@mail.nuku.my.id', pass: 'a06fed28e9ed3b008d18a58f38aca737-9b1bf5d3-04283874' }
    })
    const sender = 'notifikasi@mail.example.com'
    const email  = { from:sender, to:data.to, subject:data.subject, ...(data.text && {text: data.text}), ...(data.html && {html : data.html}) }
    transport.sendMail(email, (err, info) => { if (err) { console.log(err); return err } else { console.log(info); return info } })
}

module.exports.sending_email_via_http = (data) => {
    //const to    = ['ali.fahmi.pn@gmail.com', 'fahmi@siesta.id']
    const sender  = 'OUR POSTMAN <notifikasi@mail.example.com>'
    //const payload = { from: sender, to: to.join(', '), subject: data.subject, ...(data.text && {text: data.text}), ...(data.html && {html : data.html}) }
    const payload = { from: sender, to: data.to, subject: data.subject, ...(data.text && {text: data.text}), ...(data.html && {html : data.html}) }
    const mailgunConfig = { apiKey: null, domain: null }
    if(data.domain=='madrasahqu'){ mailgunConfig.apiKey = MG_API_KEY.madrasahqu; mailgunConfig.domain = MG_DOMAIN.madrasahqu }
    else{ mailgunConfig.apiKey = MG_API_KEY.nuku; mailgunConfig.domain = MG_DOMAIN.nuku }
    const mg = mailgun(mailgunConfig)
    mg.messages().send(payload, (error, body) => { console.log(body); return body })
}