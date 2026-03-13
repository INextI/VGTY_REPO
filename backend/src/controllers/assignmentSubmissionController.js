const assignmentSubmissionService = require('../services/assignmentSubmissionService')

class AssignmentSubmissionController {

    async submit(req, res) {

        try {

            const submission = await assignmentSubmissionService.submit(req.body)

            res.json(submission)

        } catch (e) {

            res.status(400).json({
                message: "Student already submitted this assignment"
            })

        }

    }

    async getByAssignment(req, res) {

        try {

            const submissions =
                await assignmentSubmissionService.getByAssignment(req.params.assignment_id)

            res.json(submissions)

        } catch (e) {

            res.status(500).json({ message: e.message })

        }

    }

    async grade(req, res) {

        try {

            const { score, graded_by } = req.body

            const submission =
                await assignmentSubmissionService.grade(req.params.id, score, graded_by)

            res.json(submission)

        } catch (e) {

            res.status(404).json({ message: e.message })

        }

    }

}

module.exports = new AssignmentSubmissionController()