const assignmentService = require('../services/assignmentService')

class AssignmentController {

    async create(req, res) {
        try {

            const assignment = await assignmentService.create(req.body)

            res.json(assignment)

        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }


    async getAll(req, res) {

        try {

            const { discipline_id } = req.query

            const assignments =
                await assignmentService.getAllByDiscipline(discipline_id)

            res.json(assignments)

        } catch (e) {

            res.status(500).json({ message: e.message })

        }
    }


    async getOne(req, res) {

        try {

            const assignment =
                await assignmentService.getById(req.params.id)

            res.json(assignment)

        } catch (e) {

            res.status(404).json({ message: e.message })

        }
    }


    async update(req, res) {

        try {

            const assignment =
                await assignmentService.update(req.params.id, req.body)

            res.json(assignment)

        } catch (e) {

            res.status(500).json({ message: e.message })

        }
    }


    async delete(req, res) {

        try {

            await assignmentService.delete(req.params.id)

            res.json({ message: "Deleted" })

        } catch (e) {

            res.status(500).json({ message: e.message })

        }
    }


    async createFull(req, res) {

        try {

            const assignment =
                await service.createFullAssignment(req.body)

            res.json(assignment)

        } catch (e) {

            res.status(500).json({
                message: e.message
            })

        }
    }

}

module.exports = new AssignmentController()