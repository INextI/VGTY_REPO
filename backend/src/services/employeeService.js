const Employee = require('../models/employeeModel')

class EmployeeService {
    async createEmployee(data) {
        return await Employee.create(data)
    }

    async getAllEmployes() {
        return await Employee.findAll()
    }

    async getEmployeeById(id) {
        return await Employee.findByPk(id)
    }

    async updateEmployee(id, data) {
        const user = await findByPk(id)
        if (!user) throw new Error("Пользователь не найден")    // НАПИСАТЬ ПОТОМ ОШИБКУ ОТДЕЛЬНО

        return await user.update(data)
    }

    async deleteEmployee(id) {
        const user = await findByPk(id)
        if (!user) throw new Error("Пользователь не найден")    // НАПИСАТЬ ПОТОМ ОШИБКУ ОТДЕЛЬНО

        await user.destroy()
        return { message: 'Удален'}
    }
}

module.exports = new EmployeeService()