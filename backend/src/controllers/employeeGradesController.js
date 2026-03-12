// controllers/employeeGradesController.js
const employeeGradesService = require('../services/employeeGradesService');

class employeeGradesController {
    async create(req, res, next) {
        try {
            const position = await employeeGradesService.create(req.body);
            return res.status(201).json(position);
        } catch (e) {
            next(e);
        }
    }

    async getAll(req, res, next) {
        try {
            const employeeGrades = await employeeGradesService.getAll();
            return res.status(200).json(employeeGrades);
        } catch (e) {
            next(e);
        }
    }

    async getById(req, res, next) {
        try {
            const position = await employeeGradesService.getById(req.params.id);
            if (!position) {
                return res.status(404).json({ message: 'Должность не найдена' });
            }
            return res.status(200).json(position);
        } catch (e) {
            next(e);
        }
    }

    async update(req, res, next) {
        try {
            const position = await employeeGradesService.update(req.params.id, req.body);
            if (!position) {
                return res.status(404).json({ message: 'Должность не найдена' });
            }
            return res.status(200).json(position);
        } catch (e) {
            next(e);
        }
    }

    async delete(req, res, next) {
        try {
            const result = await employeeGradesService.delete(req.params.id);
            if (!result) {
                return res.status(404).json({ message: 'Должность не найдена' });
            }
            return res.status(204).send();
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new employeeGradesController();