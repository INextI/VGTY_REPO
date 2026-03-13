const  AssignmentFiles  = require('../models/assignmentFiles')

class AssignmentFileService {

    async create(data) {

        return AssignmentFiles.create(data)

    }

    async getByAssignment(assignment_id) {

        return AssignmentFiles.findAll({
            where: { assignment_id }
        })

    }

    async delete(id) {

        const file = await AssignmentFiles.findByPk(id)

        if (!file) {
            throw new Error("File not found")
        }

        await file.destroy()

        return true
    }

}

module.exports = new AssignmentFileService()