const Joi = require("joi")
const { uuid } = require("./common/idParamSchema")

const url = Joi.string().uri()

exports.createMaterial = Joi.object({

    assignment_id: uuid.required(),

    title: Joi.string()
        .min(2)
        .max(255)
        .required(),

    url: url.optional()

})