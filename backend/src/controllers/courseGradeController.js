const courseGradeService = require('../services/courseGradeService')

class CourseGradeController {

    async createOrUpdate(req, res) {

        try {

            const grade = await courseGradeService.createOrUpdate(req.body)

            res.json(grade)

        } catch (e) {

            res.status(500).json({ message: e.message })

        }

    }

    async getStudentGrades(req, res) {

        try {

            const grades =
                await courseGradeService.getStudentGrades(req.params.student_id)

            res.json(grades)

        } catch (e) {

            res.status(500).json({ message: e.message })

        }

    }

}

module.exports = new CourseGradeController()