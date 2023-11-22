const config   = require('../config')
const response = { 
                    'request_param': "", 
                    'status'       : 'success', 
                    'error_message': null, 
                    'data'         : {},
                    'next'         : "",
                    'version'      : { "code": config.app_version, "name": config.app_semantic }
                 }

module.exports.default = response

module.exports.error = (errType) => {
        let errorMsg = ''
        if(errType == 'forbidden'){
            errorMsg = 'Bad Request - Unauthorized: '
        }
        else if(errType == 'registration'){
            errorMsg = 'Bad Request - Signup Error: '
        }
        else if(errType == 'activation'){
            errorMsg = 'Bad Activation Request - Activation Error: '
        }
        else if(errType == 'reset_pin'){
            errorMsg = 'Bad Reset PIN Request - PIN Reset Error: '
        }
        else if(errType == 'reset_device'){
            errorMsg = 'Bad Reset Device Request - Reset Device Error: '
        }
        else if(errType == 'login'){
            errorMsg = 'Bad Signin Request - Signin Error: '
        }
        else if(errType == 'authorization'){
            errorMsg = 'Bad Device Authorization - Device Mismatch: '
        }
        else if(errType == 'session'){
            errorMsg = 'Bad Session - Session is Error/Expired: '
        }
        else if(errType == 'connection'){
            errorMsg = 'Bad Connection - Connection is Error/Expired (RTO): '
        }
        else if(errType == 'unknown'){
            errorMsg = 'Bad Session - Unknown Error has happened: '
        }
        else if(errType == 'system'){
            errorMsg = 'Bad System Error - System Error has happened: '
        }

        return { 
            'request_param': "", 
            'status'       : 'error', 
            'error_message': errorMsg, 
            'data'         : null,
            'next'         : "",
            'version'      : { "code": config.app_version, "name": config.app_semantic }
        }
}