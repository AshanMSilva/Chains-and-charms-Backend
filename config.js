const config = require('config');

if (!config.get('secretKey')) {
    throw new Error('FATAL ERROR !!! : jwt Secret Key is not defined.');
    // process.exit(1);
}

module.exports = {    
    'secretKey': config.get('secretKey'),
    'mongoUrl': config.get('mongoUrl'),
    'businessEmail': config.get('businessEmail'),
    'businessPassword': config.get('businessPassword')
}