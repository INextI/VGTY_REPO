const CourseGrade = require('../models/CourseGrade')

class CourseGradeService {

    async createOrUpdate(data) {

        const {
            discipline_id,
            student_id,
            final_score,
            graded_by
        } = data

        const [grade, created] = await CourseGrade.findOrCreate({

            where: {
                discipline_id,
                student_id
            },

            defaults: {
                final_score,
                graded_by,
                graded_at: new Date()
            }

        })

        if (!created) {

            grade.final_score = final_score
            grade.graded_by = graded_by
            grade.graded_at = new Date()

            await grade.save()
        }

        return grade
    }

    async getStudentGrades(student_id) {

        return CourseGrade.findAll({
            where: { student_id }
        })

    }

}

module.exports = new CourseGradeService()