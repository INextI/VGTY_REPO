const Joi = require('joi');

const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const {error, value} = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            return res.status(400).json({
                message: 'Ошибка валидации',
                erorrs: error.details.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }

        req[property] = value;
        next();
    }
}

module.exports = validate;