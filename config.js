const config = require('config');

if (!config.get('e_com_secretKey')) {
    throw new Error('FATAL ERROR !!! : jwt Secret Key is not defined.');
    // process.exit(1);
}

module.exports = {    
    'secretKey': config.get('e_com_secretKey'),
    'mongoUrl': config.get('e_com_mongoUrl'),
    'businessEmail': config.get('e_com_businessEmail'),
    'businessPassword': config.get('e_com_businessPassword')
}