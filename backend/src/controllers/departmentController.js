// controllers/departmentController.js
const departmentService = require('../services/departmentService');

class DepartmentController {
    async create(req, res, next) {
        try {
            const department = await departmentService.create(req.body);
            return res.status(201).json(department);
        } catch (e) {
            next(e);
        }
    }

    async getAll(req, res, next) {
        try {
            const departments = await departmentService.getAll();
            return res.status(200).json(departments);
        } catch (e) {
            next(e);
        }
    }

    async getById(req, res, next) {
        try {
            const department = await departmentService.getById(req.params.id);
            if (!department) {
                return res.status(404).json({ message: 'Кафедра не найдена' });
            }
            return res.status(200).json(department);
        } catch (e) {
            next(e);
        }
    }

    async update(req, res, next) {
        try {
            const department = await departmentService.update(req.params.id, req.body);
            if (!department) {
                return res.status(404).json({ message: 'Кафедра не найдена' });
            }
            return res.status(200).json(department);
        } catch (e) {
            next(e);
        }
    }

    async delete(req, res, next) {
        try {
            const result = await departmentService.delete(req.params.id);
            if (!result) {
                return res.status(404).json({ message: 'Кафедра не найдена' });
            }
            return res.status(204).send();
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new DepartmentController();