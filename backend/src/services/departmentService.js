// services/departmentService.js
const Department = require('../models/departmentsModel');

class DepartmentService {
    async create(data) {
        return await Department.create(data);
    }

    async getAll() {
        return await Department.findAll();
    }

    async getById(id) {
        return await Department.findByPk(id);
    }

    async update(id, data) {
        const department = await Department.findByPk(id);
        if (!department) return null;
        return await department.update(data);
    }

    async delete(id) {
        const department = await Department.findByPk(id);
        if (!department) return null;
        await department.destroy();
        return true;
    }

    async getByName(name) {
        return await Department.findOne({ where: { name } });
    }
}

module.exports = new DepartmentService();