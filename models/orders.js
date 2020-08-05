const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var contactDetails = new Schema({
    bill_to_forename:{
        type: String,
        required: true
    },
    bill_to_surname:{
        type: String,
        required: true
    },
    bill_to_email:{
        type: String,
        required: true
    },
    bill_to_phone:{
        type: String,
        required: true
    },
    bill_to_address_line1:{
        type: String,
        required: true
    },
    bill_to_address_city:{
        type: String,
        required: true
    },
    bill_to_address_state:{
        type: String,
        required: true
    },
    bill_to_address_country:{
        type: String,
        required: true
    },
    bill_to_address_postal_code:{
        type: String,
        required: true
    },
    ship_to_address_line1:{
        type: String,
        required: true
    },
    ship_to_address_city:{
        type: String,
        required: true
    },
    ship_to_address_state:{
        type: String,
        required: true
    },
    ship_to_address_country:{
        type: String,
        required: true
    },
    ship_to_address_postal_code:{
        type: String,
        required: true
    },
});

var paymentDetailsSchema = new Schema({
    cardNumber:{
        type: String,
        required: true
    }
});

var itemSchema = new Schema({

    product_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    // cost:{
    //     type: Number,
    //     required: true,
    //     min: 0
    // }
});

var orderSchema = new Schema({
    reference_number:{
        type: String,
        required:true,
        unique : true
    },
    orderItems:[itemSchema],
    amount:{
        type: Number,
        required:true
    },
    status: {
        type: String,
        default: 'Proccessing'
    },
    shipToDifferent: {
        type: Boolean,
        default: false
    },
    orderedDate: {
        type: Date,
        default: Date.now()
    },
    orderNotes: {
        type: String,
        default: 'None'
    },
    expiredDate:{
        type: Date,
        default: +new Date() + 60*24*60*60*1000
    },
    contactDetails: contactDetails,
}, {
    timestamps: true
});


var Orders = mongoose.model('Order', orderSchema);

module.exports = Orders;
