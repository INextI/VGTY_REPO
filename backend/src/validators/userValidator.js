const Joi = require('joi');

const uuid = Joi.string().uuid()

exports.createUserSchema = Joi.object({
    login: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(6).max(50).required(),
    role_name: Joi.string().required(),
    is_active: Joi.boolean().optional()
});

exports.updateUserSchema =Joi.object({
    login: Joi.string().min(3).max(50).optional(),
    is_active: Joi.boolean().optional(),
    role_id: uuid.optional()
}).min(1)

exports.idParamSchema = Joi.object({
    id: uuid.required()
})

exports.createFullUserSchema = Joi.object({
    login: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(6).max(50).required(),
    role: Joi.string().valid('student', 'employee', 'admin').required(),

    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    patronymic: Joi.string().allow(null, ''),

    birth_date: Joi.date().required(),

    group_name: Joi.when('role', {
        is: 'student',
        then: Joi.string().required(),
        otherwise: Joi.forbidden()
    }),
    
    education_form_name: Joi.when('role', {
        is: 'student',
        then: Joi.string().valid('full-time', 'correspondence').required(),
        otherwise: Joi.forbidden()
    }),

    faculty_name: Joi.when('employee', {
        is: 'employee',
        then: Joi.string().min(2),
        otherwise: Joi.forbidden()
    })
})