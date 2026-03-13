const Joi = require("joi")
const { uuid } = require("./common/idParamSchema")

const url = Joi.string().uri()

const materialSchema = Joi.object({
    title: Joi.string().max(255).required(),
    url: url.optional()
})

const fileSchema = Joi.object({
    url: url.required()
})

exports.createAssignment = Joi.object({

    discipline_id: uuid.required(),

    author_employee_id: uuid.required(),

    title: Joi.string()
        .min(3)
        .max(255)
        .required(),

    description: Joi.string()
        .allow("", null),

    deadline: Joi.date()
        .greater("now")
        .optional(),

    max_score: Joi.number()
        .integer()
        .min(1)
        .max(1000)
        .default(100)

})

exports.updateAssignment = Joi.object({

    title: Joi.string().min(3).max(255),

    description: Joi.string().allow("", null),

    deadline: Joi.date(),

    max_score: Joi.number().integer().min(1).max(1000)

})

exports.createFullAssignment = Joi.object({

    discipline_id: uuid.required(),

    author_employee_id: uuid.required(),

    title: Joi.string().min(3).max(255).required(),

    description: Joi.string().allow("", null),

    deadline: Joi.date().optional(),

    max_score: Joi.number().integer().min(1).max(1000).default(100),

    materials: Joi.array().items(materialSchema).default([]),

    files: Joi.array().items(fileSchema).default([])

})