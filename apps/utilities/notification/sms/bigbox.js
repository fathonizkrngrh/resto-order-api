"use strict"

const axios               = require('axios')
const qs                  = require('qs')
const account_api_key     = "IeEQTNwU1dTs1VJ8LXWYT2WCEQiYBCjW" //-1 infinity acces token
const account_user_name   = 'warungbabe'
const account_user_pass   = 'd2FydW5nYm'
const account_user_sender = 'Warung BABE'

module.exports.sending_sms = (msisdn, content, type) => { 
    let sending_sms_endpoint = "https://api.thebigbox.id/sms-notification/1.0.0/messages"
    let sending_sms_data     = { 'msisdn': msisdn, 'content': content }
    let sending_sms_payload  = qs.stringify(sending_sms_data)
    let sending_sms_config   = {
            headers: {
                'x-api-key': account_api_key,
                'X-MainAPI-Username': account_user_name,
                'X-MainAPI-Password': account_user_pass,
                'X-MainAPI-Senderid': account_user_sender,
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            }
    }

    axios.post(sending_sms_endpoint, sending_sms_payload, sending_sms_config)
    .then(result => { sent_report = result.data; return sent_report }) 
    .catch(err => { 
        sent_report = { status: "ERROR", message: "FAILED SENDING SMS" }
        console.log('axios send sms error: ' + err)
        return sent_report
    })

}

//https://codeburst.io/introduction-to-redis-node-js-demo-f3326dd43c0f