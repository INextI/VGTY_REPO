const Group = require('../models/groupModel')
const academicYearService = require('./academicYearService')

class GroupService {
    async createGroup(data) {
        const academYear = await academicYearService.getAcademicYearByValue(data.academic_year)
        return await Group.create({
            name: data.name,
            edu_program_id: data.edu_program_id,
            curator_id: data.curator_id || null,
            academic_year_id: academYear.id
        })
    }

    async getAllGroups() {
        return await Group.findAll()
    }

    async getGroupById(id) {
        return await Group.findByPk(id)
    }

    async updateGroup(id, data) {
        const group = await Group.findByPk(id)
        if (!group) throw new Error("Группа не найдена")    // НАПИСАТЬ ПОТОМ ОШИБКУ ОТДЕЛЬНО

        return await group.update(data)
    }

    async deleteGroup(id) {
        const group = await Group.findByPk(id)
        if (!group) throw new Error("Группа не найдена")    // НАПИСАТЬ ПОТОМ ОШИБКУ ОТДЕЛЬНО

        await group.destroy()
        return { message: 'Удален'}
    }

    async getGroupByName(name) {
        return await Group.findOne({where: {name}})
    }
}

module.exports = new GroupService()