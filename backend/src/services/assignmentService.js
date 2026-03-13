const  Assignment  = require('../models/assignmentModel')
const AssignmentFiles = require('../models/assignmentFiles')
const AssignmentMaterials = require('../models/assignmentMaterials')
const sequelize = require('../config/db')

class AssignmentService {

    async create(data) {

        const assignment = await Assignment.create(data)

        return assignment
    }

    async getAllByDiscipline(discipline_id) {

        return Assignment.findAll({
            where: { discipline_id }
        })
    }

    async getById(id) {

        const assignment = await Assignment.findByPk(id)

        if (!assignment) {
            throw new Error("Assignment not found")
        }

        return assignment
    }

    async update(id, data) {

        const assignment = await this.getById(id)

        if (!assignment) {
            throw new Error("Assignment not found")
        }

        await assignment.update(data)

        return assignment
    }

    async delete(id) {

        const assignment = await this.getById(id)

        if (!assignment) {
            throw new Error("Assignment not found")
        }

        await assignment.destroy()

        return true
    }

    async createFullAssignment(data) {

        const transaction = await sequelize.transaction()

        try {

            const {
                materials = [],
                files = [],
                ...assignmentData
            } = data


            // 1 создаем задание
            const assignment = await Assignment.create(
                assignmentData,
                { transaction }
            )


            // 2 добавляем материалы
            if (materials.length) {

                const materialsData = materials.map(m => ({
                    ...m,
                    assignment_id: assignment.id
                }))

                await AssignmentMaterials.bulkCreate(
                    materialsData,
                    { transaction }
                )
            }


            // 3 добавляем файлы
            if (files.length) {

                const filesData = files.map(f => ({
                    ...f,
                    assignment_id: assignment.id
                }))

                await AssignmentFiles.bulkCreate(
                    filesData,
                    { transaction }
                )
            }


            await transaction.commit()

            return Assignment.findByPk(assignment.id, {
                include: [
                    { model: AssignmentFiles },
                    { model: AssignmentMaterials }
                ]
            })

        } catch (error) {

            await transaction.rollback()

            throw error
        }
    }


}

module.exports = new AssignmentService()