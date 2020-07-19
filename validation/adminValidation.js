const Joi = require('@hapi/joi');
const get_err_list = require('./get_err_list');
Joi.objectId = require('joi-objectid')(Joi);

function validateAdminGet(query){
    let err_list = [];
    let key_arr = ['firstName', 'lastName', 'email'];
    Object.keys(query).forEach(element => {
        if (!key_arr.includes(element)) err_list.push(`${element} is an invalid query parameter.`);
        // const {error} = Joi.string().min(3).max(25).validate(query[element]);
        // if(error) err_list.push(error.details[0].message.replace('value', `${element}`));
    });
    return err_list;
}

function validateAdminSignUp(body){
    const schema = Joi.object({
        email: Joi.string().email({minDomainSegments: 2}).min(5).max(50).required(),
        password: Joi.string()
            .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&^_+\-=])[A-Za-z\d@$!%*#?&^_+\-=]{6,20}$/)
            .required(),
        firstName: Joi.string().min(3).max(25).required(),
        lastName: Joi.string().min(3).max(25).required()
    })
    let {error} = schema.validate(body, {abortEarly: false});
    return get_err_list(error);
}

function validateAdminLogin(body) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(50).required(),
        password: Joi.string().max(50).required()
    })
    const {error} = schema.validate(body);
    if (error) return error.details[0].message;
    return null;
}

function validateChangePassword(body) {
    const schema = Joi.object({
        oldpassword: Joi.string().max(50).required(),
        newpassword: Joi.string()
        .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&^_+\-=])[A-Za-z\d@$!%*#?&^_+\-=]{6,20}$/)
        .required()
    })

    let {error} = schema.validate(body);
    if (error) return error.details[0].message;
    return null;
}

function validateAdminPut(body) {
    const schema = Joi.object({
        email: Joi.string().email({minDomainSegments: 2}).min(5).max(50),        
        firstName: Joi.string().min(3).max(25),
        lastName: Joi.string().min(3).max(25),
        image: Joi.string().min(3)
    })
    let {error} = schema.validate(body, {abortEarly: false});
    return get_err_list(error);
}

module.exports = {
    validateAdminGet,
    validateAdminSignUp,
    validateAdminLogin,
    validateChangePassword,
    validateAdminPut
}