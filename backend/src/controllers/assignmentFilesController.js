const service = require('../services/assignmentFileService')

class AssignmentFileController {

    async create(req, res) {

        try {

            const file = await service.create(req.body)

            res.json(file)

        } catch (e) {

            res.status(500).json({ message: e.message })

        }

    }

    async getByAssignment(req, res) {

        try {

            const files =
                await service.getByAssignment(req.params.assignment_id)

            res.json(files)

        } catch (e) {

            res.status(500).json({ message: e.message })

        }

    }

    async delete(req, res) {

        try {

            await service.delete(req.params.id)

            res.json({ message: "Deleted" })

        } catch (e) {

            res.status(500).json({ message: e.message })

        }

    }

}

module.exports = new AssignmentFileController()