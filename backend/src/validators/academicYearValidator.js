const Joi = require('joi');

exports.createAcademicYearSchema = Joi.object({
    course_year: Joi.number().integer().required()
})