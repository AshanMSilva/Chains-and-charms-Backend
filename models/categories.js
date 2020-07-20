const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// require('mongoose-currency').loadType(mongoose);
// const Currency = mongoose.Types.Currency;

var categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String
    }
    // products: [{
    //    type: mongoose.Schema.Types.ObjectId,
    //    ref: 'Product'
    // }]
}, {
    timestamps: true
});


var Categories = mongoose.model('Category', categorySchema);

module.exports = Categories;
