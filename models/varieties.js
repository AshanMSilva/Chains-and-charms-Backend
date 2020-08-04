const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var varietySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        default: 'varieties/default-variety.png'
    }
}, {
    timestamps: true
});


var Varieties = mongoose.model('Variety', varietySchema);

module.exports = Varieties;