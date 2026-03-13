const Joi = require("joi")
const { uuid } = require("./common/idParamSchema")

const url = Joi.string().uri()

exports.submitAssignment = Joi.object({

    assignment_id: uuid.required(),

    student_id: uuid.required(),

    file_url: Joi.string().uri().required(),

    comment: Joi.string()
        .max(2000)
        .allow("", null)

})

exports.gradeSubmission = Joi.object({

    score: Joi.number()
        .integer()
        .min(0)
        .max(100)
        .required(),

    graded_by: uuid.required()

})