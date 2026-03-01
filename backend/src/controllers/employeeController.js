const employeeService = require('../services/employeeService')

class EmployeeController {
    async create(req, res, next) {
        try{
            const user = await employeeService.createEmployee(req.body)
            return res.status(201).json(user)
        } catch (e) {
            next(e)
        }
    }

    async getAll(req,res, next) {
        try {
            const users = await employeeService.getAllEmployes()
            return res.json(users)
        } catch (e) {
            next(e)
        }
    }

    async getOne(req, res, next) {
        try {
            const user = await employeeService.getEmployeeById(req.params.id)
            return res.json(user)
        } catch (e) {
            next(e)
        }
    }

    async update(req, res, next) {
        try {
            const user = await employeeService.updateEmployee(req.params.id, req.body)
            return res.json(user)
        } catch (e) {
            next(e)
        }
    }

    async delete(req, res, next) {
        try {
            const result = await employeeService.deleteEmployee(req.params.id)
            return res.json(result)
        } catch (e) {
            next(e)
        }
    }
}


module.exports = new EmployeeController()