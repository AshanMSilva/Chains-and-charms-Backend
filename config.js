const config = require('config');

if (!config.get('secretKey')) {
    throw new Error('FATAL ERROR !!! : jwt Secret Key is not defined.');
    // process.exit(1);
}

module.exports = {
    
    'secretKey': process.env.secretKey,
    'mongoUrl': process.env.mongoUrl,
    'businessEmail': process.env.businessEmail,
    'businessPassword': process.env.businessPassword
}