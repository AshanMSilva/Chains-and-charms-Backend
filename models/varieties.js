const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var varietySchema = new Schema({
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


var Varieties = mongoose.model('Variety', varietySchema);

module.exports = Varieties;