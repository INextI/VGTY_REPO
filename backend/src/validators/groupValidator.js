const Joi = require('joi');
const uuid = Joi.string().uuid()

exports.createGroupSchema = Joi.object({
    name: Joi.string().required(),
    edu_program_id: uuid.required(),
    curator_id: uuid.optional(),
    academic_year: Joi.number().integer().required()
})

exports.updateGroupSchema = Joi.object({
    name: Joi.string().optional(),
    edu_program_id: uuid.optional(),
    curator_id: uuid.optional(),
    academic_year: Joi.number().integer().optional()
}).min(1)

exports.idParamSchema = Joi.object({
    id: uuid.required()
})