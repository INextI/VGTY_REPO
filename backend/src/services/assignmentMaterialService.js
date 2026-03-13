const  AssignmentMaterials  = require('../models/assignmentMaterials')

class AssignmentMaterialService {

    async create(data) {

        return AssignmentMaterials.create(data)

    }

    async getByAssignment(assignment_id) {

        return AssignmentMaterials.findAll({
            where: { assignment_id }
        })

    }

    async delete(id) {

        const material = await AssignmentMaterials.findByPk(id)

        if (!material) {
            throw new Error("Material not found")
        }

        await material.destroy()

        return true
    }

}

module.exports = new AssignmentMaterialService()