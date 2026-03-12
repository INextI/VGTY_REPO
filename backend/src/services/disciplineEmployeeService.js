// services/disciplineEmployeeService.js
const DisciplineEmployee = require('../models/disciplineEmployeeModel');

class DisciplineEmployeeService {
    async create(data) {
        return await DisciplineEmployee.create(data);
    }

    async getAll() {
        return await DisciplineEmployee.findAll();
    }

    async getById(id) {
        return await DisciplineEmployee.findByPk(id);
    }

    async update(id, data) {
        const relation = await DisciplineEmployee.findByPk(id);
        if (!relation) return null;
        return await relation.update(data);
    }

    async delete(id) {
        const relation = await DisciplineEmployee.findByPk(id);
        if (!relation) return null;
        await relation.destroy();
        return true;
    }

    async getByDisciplineId(disciplineId) {
        return await DisciplineEmployee.findAll({ where: { discipline_id: disciplineId } });
    }

    async getByEmployeeId(employeeId) {
        return await DisciplineEmployee.findAll({ where: { employee_id: employeeId } });
    }

    async getByDisciplineAndEmployee(disciplineId, employeeId) {
        return await DisciplineEmployee.findOne({
            where: {
                discipline_id: disciplineId,
                employee_id: employeeId
            }
        });
    }
}

module.exports = new DisciplineEmployeeService();