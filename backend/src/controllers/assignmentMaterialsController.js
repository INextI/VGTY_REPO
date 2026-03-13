const assignmentMaterialService = require('../services/assignmentMaterialService')

class AssignmentMaterialController {

    async create(req, res) {

        try {

            const material = await assignmentMaterialService.create(req.body)

            res.json(material)

        } catch (e) {

            res.status(500).json({ message: e.message })

        }

    }

    async getByAssignment(req, res) {

        try {

            const materials =
                await assignmentMaterialService.getByAssignment(req.params.assignment_id)

            res.json(materials)

        } catch (e) {

            res.status(500).json({ message: e.message })

        }

    }

    async delete(req, res) {

        try {

            await assignmentMaterialService.delete(req.params.id)

            res.json({ message: "Deleted" })

        } catch (e) {

            res.status(500).json({ message: e.message })

        }

    }

}

module.exports = new AssignmentMaterialController()