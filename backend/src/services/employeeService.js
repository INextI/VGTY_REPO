const Employee = require('../models/employeeModel')
const disciplineService = require('./disciplineService')


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
        const user = await Employee.findByPk(id)
        if (!user) throw new Error("Пользователь не найден")    // НАПИСАТЬ ПОТОМ ОШИБКУ ОТДЕЛЬНО

        return await user.update(data)
    }

    async deleteEmployee(id) {
        const user = await Employee.findByPk(id)
        if (!user) throw new Error("Пользователь не найден")    // НАПИСАТЬ ПОТОМ ОШИБКУ ОТДЕЛЬНО

        await user.destroy()
        return { message: 'Удален'}
    }

    async getEmployeeByUserId(userId) {
        const employee = await Employee.findOne({where: {user_id: userId}})
        if (!employee) {
            throw new Error('Сотрудник не найден')
        }
        return employee;

    }

    async getEmployeeDiscipline(userId, pagination) {
        const employee = await this.getEmployeeByUserId(userId);

        return disciplineService.getDisciplineByEmployee(
            employee.id,
            pagination
        )
    }
}

module.exports = new EmployeeService()