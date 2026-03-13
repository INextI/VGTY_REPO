const Joi = require("joi")

const { uuid } = require("./common/idParamSchema")

const url = Joi.string().uri()

exports.createOrUpdateGrade = Joi.object({

    discipline_id: uuid.required(),

    student_id: uuid.required(),

    final_score: Joi.number()
        .integer()
        .min(0)
        .max(100)
        .required(),

    graded_by: uuid.required()

})