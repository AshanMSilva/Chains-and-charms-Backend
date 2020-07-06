const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var dealerSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String
    }
}, {
    timestamps: true
});


var Dealers = mongoose.model('Dealer', dealerSchema);

module.exports = Dealers;