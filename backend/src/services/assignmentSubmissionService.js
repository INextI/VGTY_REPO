const AssignmentSubmission  = require('../models/assignmentSubmission')

class AssignmentSubmissionService {

    async submit(data) {

        return AssignmentSubmission.create(data)

    }

    async getByAssignment(assignment_id) {

        return AssignmentSubmission.findAll({
            where: { assignment_id }
        })

    }

    async grade(id, score, graded_by) {

        const submission = await AssignmentSubmission.findByPk(id)

        if (!submission) {
            throw new Error("Submission not found")
        }

        submission.score = score
        submission.graded_by = graded_by
        submission.graded_at = new Date()

        await submission.save()

        return submission
    }

}

module.exports = new AssignmentSubmissionService()