const roleService = require('../services/roleService')

class RoleController {
    async create(req, res, next) {
        try{
            const user = await roleService.createRole(req.body)
            return res.status(201).json(user)
        } catch (e) {
            next(e)
        }
    }

    async getAll(req,res, next) {
        try {
            const users = await roleService.getAllRoles()
            return res.json(users)
        } catch (e) {
            next(e)
        }
    }

    async getOne(req, res, next) {
        try {
            const user = await roleService.getRoleById(req.params.id)
            return res.json(user)
        } catch (e) {
            next(e)
        }
    }

    async update(req, res, next) {
        try {
            const user = await roleService.updateRole(req.params.id, req.body)
            return res.json(user)
        } catch (e) {
            next(e)
        }
    }

    async delete(req, res, next) {
        try {
            const result = await roleService.deleteRole(req.params.id)
            return res.json(result)
        } catch (e) {
            next(e)
        }
    }
}


module.exports = new RoleController()