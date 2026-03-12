const Joi = require('joi');

const uuid = Joi.string().uuid()

exports.createStudentSchema = Joi.object({
    user_id: uuid.required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    patronymic: Joi.string().allow(null, ''),
    birth_date: Joi.date().required(),
    faculty_id: uuid.required(),
    group_id: uuid.required(),
    education_form_id: uuid.required()
});

exports.updateStudentSchema =Joi.object({
    user_id: uuid.optional(),
    first_name: Joi.string().optional(),
    last_name: Joi.string().optional(),
    patronymic: Joi.string().optional(),
    birth_date: Joi.date().optional(),
    faculty_id: uuid.optional(),
    group_id: uuid.optional(),
    education_form_id: uuid.optional()
}).min(1)