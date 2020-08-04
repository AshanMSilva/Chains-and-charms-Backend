const config = require('config');

if (!config.get('secretKey')) {
    throw new Error('FATAL ERROR !!! : jwt Secret Key is not defined.');
    // process.exit(1);
}

if (!config.get('businessPassword')) {
    throw new Error('FATAL ERROR !!! : businessPassword is not defined');
}

if (!config.get('s3Bucket')) {
    throw new Error('FATAL ERROR !!! : s3Bucket is not defined');
}

if (!config.get('s3AccessKey')) {
    throw new Error('FATAL ERROR !!! : s3AccessKey is not defined');
}

if (!config.get('s3SecretKey')) {
    throw new Error('FATAL ERROR !!! : s3SecretKey is not defined');
}

module.exports = {    
    'secretKey': config.get('secretKey'),
    'mongoUrl': config.get('mongoUrl'),
    'businessEmail': config.get('businessEmail'),
    'businessPassword': config.get('businessPassword')
}