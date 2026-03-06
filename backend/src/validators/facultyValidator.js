const Joi = require('joi');

exports.facultySchema = Joi.object({
    name: Joi.string().min(2)
})