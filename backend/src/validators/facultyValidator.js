const Joi = require('joi');

exports.createFacultySchema = Joi.object({
    name: Joi.string().min(2).required()
})

exports.updateFacultySchema = Joi.object({
    name: Joi.string().min(2).required()
})