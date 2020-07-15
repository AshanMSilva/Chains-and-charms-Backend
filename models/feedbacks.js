var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var feedbackSchema = new Schema({

    name: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    subject: {
        type: String
    },
    message: {
        type : String,
        required : true
    },
    markAsRead : {
        type : Boolean,
        default : false
    }
});

var Feedbacks = mongoose.model('feedback', feedbackSchema);

module.exports = Feedbacks;
