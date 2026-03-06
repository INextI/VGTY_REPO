const Joi = require('joi');
const uuid = Joi.string().uuid()

exports.createDisciplineSchema = Joi.object({
    name: Joi.string().min(2).max(255).required(),
    owner_employee_id: uuid.allow(null),
    description: Joi.string().max(2000).allow('', null),
    group_name: Joi.string().min(2).required(),
    education_form_name: Joi.string().valid('full-time', 'correspondence').required()
});

exports.updateDisciplineSchema = Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    owner_employee_id: uuid.allow(null).optional(),
    description: Joi.string().max(2000).allow('', null).optional(),
    group_id: uuid.optional(),
    education_form_id: uuid.optional()
}).min(1);