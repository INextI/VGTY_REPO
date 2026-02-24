const Group = require('../models/groupModel')

class GroupService {
    async createGroup(data) {
        return await Group.create(data)
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
}

module.exports = new GroupService()