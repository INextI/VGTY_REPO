// controllers/disciplineEmployeeController.js
const disciplineEmployeeService = require('../services/disciplineEmployeeService');

class DisciplineEmployeeController {
    async create(req, res, next) {
        try {
            const relation = await disciplineEmployeeService.create(req.body);
            return res.status(201).json(relation);
        } catch (e) {
            next(e);
        }
    }

    async getAll(req, res, next) {
        try {
            const relations = await disciplineEmployeeService.getAll();
            return res.status(200).json(relations);
        } catch (e) {
            next(e);
        }
    }

    async getById(req, res, next) {
        try {
            const relation = await disciplineEmployeeService.getById(req.params.id);
            if (!relation) {
                return res.status(404).json({ message: 'Связь дисциплины и сотрудника не найдена' });
            }
            return res.status(200).json(relation);
        } catch (e) {
            next(e);
        }
    }

    async update(req, res, next) {
        try {
            const relation = await disciplineEmployeeService.update(req.params.id, req.body);
            if (!relation) {
                return res.status(404).json({ message: 'Связь дисциплины и сотрудника не найдена' });
            }
            return res.status(200).json(relation);
        } catch (e) {
            next(e);
        }
    }

    async delete(req, res, next) {
        try {
            const result = await disciplineEmployeeService.delete(req.params.id);
            if (!result) {
                return res.status(404).json({ message: 'Связь дисциплины и сотрудника не найдена' });
            }
            return res.status(204).send();
        } catch (e) {
            next(e);
        }
    }

    async getByDisciplineId(req, res, next) {
        try {
            const relations = await disciplineEmployeeService.getByDisciplineId(req.params.disciplineId);
            return res.status(200).json(relations);
        } catch (e) {
            next(e);
        }
    }

    async getByEmployeeId(req, res, next) {
        try {
            const relations = await disciplineEmployeeService.getByEmployeeId(req.params.employeeId);
            return res.status(200).json(relations);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new DisciplineEmployeeController();