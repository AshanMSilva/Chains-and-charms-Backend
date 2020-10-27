const Joi = require('@hapi/joi');
const get_err_list = require('./get_err_list');
const Varieties = require('../models/varieties');
const Categories = require('../models/categories');
Joi.objectId = require('joi-objectid')(Joi);

function validateProductPost(body) {
    const schema = Joi.object({
        productCode: Joi.string().min(3).max(10).required(),
        name: Joi.string().min(1).max(50).required(),
        variety: Joi.objectId().required(),
        category: Joi.objectId().required(),
        carotSize: Joi.string().min(1).max(10).required(),
        materialUsed: Joi.string().max(50).required(),
        image: Joi.string().min(3).max(50),
        price: Joi.number().positive().required(),
        availability: Joi.number().integer().min(0).required(),
        color: Joi.string().valid('gold', 'silver').required(),
        size: Joi.string().max(25),
        oldPrice: Joi.number(),
        isDiscountApplied: Joi.boolean()
    })
    let {error} = schema.validate(body, {abortEarly: false});
    return get_err_list(error);
}

function validateProductPut(body) {
    // const schema = Joi.object({
    //     productCode: Joi.string().min(3).max(10),
    //     variety: Joi.objectId(),
    //     category: Joi.objectId(),
    //     image: Joi.string().min(3).max(50),
    // })
    const schema = Joi.object({
        productCode: Joi.string().min(3).max(10),
        name: Joi.string().min(1).max(50),
        variety: Joi.objectId(),
        category: Joi.objectId(),
        carotSize: Joi.string().min(1).max(10),
        materialUsed: Joi.string().max(50),
        image: Joi.string().min(3).max(50),
        price: Joi.number().positive(),
        availability: Joi.number().integer().min(0),
        color: Joi.string().valid('gold', 'silver'),
        size: Joi.string().max(25),
        deliveryStatus: Joi.string().valid('Pending', 'Delivered'),
        totalRating: Joi.number().positive(),
        oldPrice: Joi.number(),
        isDiscountApplied: Joi.boolean()
    })
    let {error} = schema.validate(body, {abortEarly: false});
    return get_err_list(error);
}

async function validateCategory_Variety(category, variety) {
    let ref_errors = [];
    if(category) {
        let category_result = await Categories.findById(category);
        if (!category_result) ref_errors.push(`A category does not exist by the id ${category}.`);
    }
    if (variety) {
        let variety_result = await Varieties.findById(variety);
        if (!variety_result) ref_errors.push(`A variety does not exist by the id ${variety}.`);
    }
    return ref_errors;
}

function validateVarientPost(body) {
    const schema = Joi.object({
        carotSize: Joi.string().min(1).max(10).required(),
        materialUsed: Joi.string().max(50).required(),
        image: Joi.string().min(3).max(50),
        price: Joi.number().positive().required(),
        availability: Joi.number().integer().min(0).required(),
        color: Joi.string().valid('gold', 'silver').required(),
        size: Joi.string().max(25)
    })
    let {error} = schema.validate(body, {abortEarly: false});
    return get_err_list(error);
}
function validateReviewPost(body) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(30).required(),
        email: Joi.string().max(50).required(),
        message: Joi.string().min(3).required(),
        rating: Joi.number().integer().min(0).max(5).required(),

    })
    let {error} = schema.validate(body, {abortEarly: false});
    return get_err_list(error);
}

//function validateUpdateTotalRating(body) {
//    const schema = Joi.object({
//        totalRating: Joi.number().integer().min(0).max(5).required(),
//
//    })
//    let {error} = schema.validate(body, {abortEarly: false});
//    return get_err_list(error);
//}

module.exports = {
    validateProductPost,
    validateProductPut,
    validateCategory_Variety,
    validateVarientPost,
    validateReviewPost
}
