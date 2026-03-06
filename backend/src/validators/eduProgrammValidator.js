const Joi = require('joi');
const uuid = Joi.string().uuid()

exports.createEduProgrammSchema = Joi.object({
    faculty: Joi.string().min(2),
    education_form: Joi.string().valid('full-time', 'correspondence').required(),
    name: Joi.string().min(2)
})

exports.updateEduProgrammSchema = Joi.object({
    id: uuid.required(),
    name: Joi.string().min(2).optional(),
    faculty_id: uuid.optional(),
    education_form_id: uuid.optional()

}).min(1)

exports.idParamSchema = Joi.object({
    id: uuid.required()
})