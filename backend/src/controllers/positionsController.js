// controllers/positionsController.js
const positionsService = require('../services/positionsService');

class PositionsController {
    async create(req, res, next) {
        try {
            const position = await positionsService.create(req.body);
            return res.status(201).json(position);
        } catch (e) {
            next(e);
        }
    }

    async getAll(req, res, next) {
        try {
            const positions = await positionsService.getAll();
            return res.status(200).json(positions);
        } catch (e) {
            next(e);
        }
    }

    async getById(req, res, next) {
        try {
            const position = await positionsService.getById(req.params.id);
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
            const position = await positionsService.update(req.params.id, req.body);
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
            const result = await positionsService.delete(req.params.id);
            if (!result) {
                return res.status(404).json({ message: 'Должность не найдена' });
            }
            return res.status(204).send();
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new PositionsController();