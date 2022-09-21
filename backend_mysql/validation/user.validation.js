"use strict;"
const Joi = require('joi');

const userValidateSchemaRegister = Joi.object({
    email: Joi.string()
        .email({
            minDomainSegments: 2,
            tlds: {
                allow: ['com', 'net', 'in']
            }
        })
        .required(),

    fullName: Joi.string()
        .min(3)
        .max(50)
        .required(),

    firstName: Joi.string()
        .min(3)
        .max(50),

    lastName: Joi.string()
        .min(3)
        .max(50),

    password: Joi.string()
        .min(8)
        .required(),

    repeatPassword: Joi.ref('password'),

    phoneNo: Joi.string(),

    address: Joi.string()
});

const userValidateSchemaLogin = Joi.object({
    email: Joi.string()
        .email({
            minDomainSegments: 2,
            tlds: {
                allow: ['com', 'net', 'in']
            }
        })
        .required(),

    password: Joi.string()
        .min(8)
        .required()
});
const userValidateSchemachangePassword = Joi.object({
    email: Joi.string()
        .email({
            minDomainSegments: 2,
            tlds: {
                allow: ['com', 'net', 'in']
            }
        })
        .required(),

    password: Joi.string()
        .min(8)
        .required(),
    confirmPassword: Joi.ref('password'),
});

module.exports = {
    userValidateSchemaRegister,
    userValidateSchemaLogin,
    userValidateSchemachangePassword
};