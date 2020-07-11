var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Admin = new Schema({
    firstName: {
        type: String,
        required: [true, 'first name of the admin user is required']
    },
    lastName:{
        type: String,
        required: [true, 'last name of the admin user is required']
    },
    image: {
        type: String,
        default:'default-avatar.png'
    }
    
});
Admin.plugin(passportLocalMongoose, { usernameField : 'email' });

module.exports = mongoose.model('Admin', Admin);