const Role = require('../models/roleModel')

class RoleService {
    async createRole(data) {
        return await Role.create(data)
    }

    async getAllRoles() {
        return await Role.findAll()
    }

    async getRoleById(id) {
        return await Role.findByPk(id)
    }

    async updateRole(id, data) {
        const role = await Role.findByPk(id)
        if (!role) throw new Error("Роль не найдена")

        return await role.update(data)
    }

    async deleteRole(id) {
        const role = await Role.findByPk(id)
        if (!role) throw new Error("Роль не найдена")
        await role.destroy()
        return { message: 'Удалено'}
    }

    async getRoleByName(name) {
        const role = await Role.findOne({where: {name}})
        if (!role) throw new Error("Роль с таким именем не найдена")
        return role
    }
}

module.exports = new RoleService()