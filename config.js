const config = require('config');

if (!config.get('secretKey')) {
    throw new Error('FATAL ERROR !!! : jwt Secret Key is not defined.');
    // process.exit(1);
}

module.exports = {
    'secretKey': config.get('secretKey'),
    // 'mongoUrl' : 'mongodb+srv://e_com_user:User123@chainsandcharms.hrmyt.mongodb.net/Chains-and-charms-Server?retryWrites=true&w=majority',
    'mongoUrl' : config.get('mongoUrl'),
    'businessEmail':'smanalysis.uom@gmail.com',
    'businessPassword': '123@Ashan@123'
    // 'facebook': {
    //     clientId: '506662936665383',
    //     clientSecret: '70803f1359b6db7064fd5854c76c7803'
    // }
}