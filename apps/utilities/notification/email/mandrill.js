"use strict"
const nodemailer        = require('nodemailer')
const mandrillTransport = require('nodemailer-mandrill-transport')
const mandrillKey       = 'y6dkLKZDhDrrQoWLQIeG6w'
const mandrillSender    = 'no-reply@siesta.id'

module.exports.sendmail_by_mandrill = (to, subject, content) => {
    // Configuring mandrill transport.
    const smtpTransport = nodemailer.createTransport(mandrillTransport({ auth: { apiKey : mandrillKey } }))
    // Put in email details.
    const mailData = { from : fromUser, to : to, subject : subject, html : content }
    // Sending email.
    smtpTransport.sendMail(mailData, function(error, response){
        if(error) { throw new Error("Error in sending email") }
        //console.log("Message sent: " + JSON.stringify(response))
    })
}