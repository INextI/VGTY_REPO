// services/employeeGradesService.js
const EmployeeGrades = require('../models/employeeGradesModel');

class EmployeeGradesService {
    async create(data) {
        return await EmployeeGrades.create(data);
    }

    async getAll() {
        return await EmployeeGrades.findAll();
    }

    async getById(id) {
        return await EmployeeGrades.findByPk(id);
    }

    async update(id, data) {
        const position = await EmployeeGrades.findByPk(id);
        if (!position) return null;
        return await position.update(data);
    }

    async delete(id) {
        const position = await EmployeeGrades.findByPk(id);
        if (!position) return null;
        await position.destroy();
        return true;
    }

    async getByName(name) {
        return await EmployeeGrades.findOne({ where: { name } });
    }
}

module.exports = new EmployeeGradesService();