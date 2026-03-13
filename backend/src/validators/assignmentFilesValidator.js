const Joi = require("joi")
const { uuid } = require("./common/idParamSchema")

const url = Joi.string().uri()

exports.createFile = Joi.object({

    assignment_id: uuid.required(),

    url: url.required()

})