const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// require('mongoose-currency').loadType(mongoose);

// var attributeSchema = new Schema({
//     name:{
//         type: String,
//         required: true
//     },
//     value:{
//         type: String

//     }
// },{
//     timestamps: true
// });

// var varientSchema = new Schema({
//     price: {
//         type: Number,
//         required: true,
//         // set: v => v.toFixed(2)
//     },
//     carotSize: {
//         type: String,
//         required: true
//     },
//     materialUsed:{
//         type: String,
//         required: true
//     },
//     availability:{
//         type: Number,
//         required: true
//     },
//     color: {
//         type: String,
//         enum: ['gold', 'silver'],
//         required: true
//     },
//     size: {
//         type: String,
//         default: ''
//     },
//     image: String,
//     sales: {
//         type: Number,
//         default: 0
//     }
// }, {
//     timestamps: true
// });

// var productSchema = new Schema({
//     productCode:{
//         type: String,
//         unique: true,
//         required: true
//     },
//     variety:{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Variety'
//     },
//     category:{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Category'
//     },
//     image: {
//         type: String,
//         default: 'default-product.jpg'
//     },
//     varients: [varientSchema],
//     sales: {
//         type: Number,
//         default: 0
//     }
// }, {
//     timestamps: true
// });

var reviewSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    }
}, {
    timestamps:true
});

var productSchema = new Schema({
    productCode:{
        type: String,
        unique: true,
        required: true
    },
    productName:{
        type: String,
        required: true
    },
    variety:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Variety'
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    carotSize: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: 'default-product.jpg'
    },
    price:{
        type: Number,
        required: true
    },
    availability: {
        type: Number,
        required: true
    },
    materialUsed:{
        type: String,
        required: true
    },
    color: {
        type: String,
        enum: ['gold', 'silver'],
        required: true
    },
    size: {
        type: String,
        default: ''
    },
    sales: {
        type: Number,
        default: 0
    },
    totalRating: {
        type: Number,
        default: 0
    },
    reviews: [reviewSchema]
}, {
    timestamps: true
});

var Products = mongoose.model('Product', productSchema);

module.exports = Products;
