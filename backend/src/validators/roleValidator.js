const Joi = require('joi');

exports.createRoleSchema = Joi.object({
    name: Joi.string().valid('student', 'employee', 'admin').required()
})

exports.updateRoleSchema = Joi.object({
    name: Joi.string().valid('student', 'employee', 'admin').required()
})