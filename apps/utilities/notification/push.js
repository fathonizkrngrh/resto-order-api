"use strict"

const axios   = require('axios')
const fcm_key = 'AAAAf_Rr2ig:APA91bGe0MVf85hli70S__JHZMjIhZILomI9WkEv_wyLqf6K8mm2A4oHsmKGsS9UJr4CniLF518W9ECdncTtUhc-f-h8NFPRDCLU0M5nAM_bpeDxYPRk2U_OA1b8F3zUBOQHiMWmVMud'
const fcm_url = "https://fcm.googleapis.com/fcm/send"

module.exports.sending_fcm = (users, notification, data) => {
    const fcm_payload = { registration_ids: users, notification: notification, data: data }
    const fcm_config  = {
        headers: { 
            'Authorization': 'key=' + fcm_key, 'Content-Type': 'application/json'
        }
    }

    axios.post(fcm_url, fcm_payload, fcm_config)
    .then(fcm_response => { console.log(fcm_response.data); return true }).catch(fcm_error => { return false })
}