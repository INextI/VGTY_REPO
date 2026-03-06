const Joi = require('joi');

exports.createEducationFormSchema = Joi.object({
    name: Joi.string().valid('full-time', 'correspondence').required()
})