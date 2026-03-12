const Joi = require('joi')

const uuid = Joi.string().uuid({ version: 'uuidv4' })

const idParamSchema = Joi.object({
  id: uuid.required()
})

module.exports = {
    idParamSchema,
    uuid
}