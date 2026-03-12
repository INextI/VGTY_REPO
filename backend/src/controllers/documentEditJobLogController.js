// controllers/documentEditJobLogController.js
const documentEditJobLogService = require('../services/documentEditJobLogService');

class DocumentEditJobLogController {
    async create(req, res, next) {
        try {
            const log = await documentEditJobLogService.create(req.body);
            return res.status(201).json(log);
        } catch (e) {
            next(e);
        }
    }

    async getAll(req, res, next) {
        try {
            const logs = await documentEditJobLogService.getAll();
            return res.status(200).json(logs);
        } catch (e) {
            next(e);
        }
    }
    async getById(req, res, next) {
        try {
            const log = await documentEditJobLogService.getById(req.params.id);
            if (!log) {
                return res.status(404).json({ message: 'Лог задания не найден' });
            }
            return res.status(200).json(log);
        } catch (e) {
            next(e);
        }
    }

    async update(req, res, next) {
        try {
            const log = await documentEditJobLogService.update(req.params.id, req.body);
            if (!log) {
                return res.status(404).json({ message: 'Лог задания не найден' });
            }
            return res.status(200).json(log);
        } catch (e) {
            next(e);
        }
    }

    async delete(req, res, next) {
        try {
            const result = await documentEditJobLogService.delete(req.params.id);
            if (!result) {
                return res.status(404).json({ message: 'Лог задания не найден' });
            }
            return res.status(204).send();
        } catch (e) {
            next(e);
        }
    }

    async getByJobId(req, res, next) {
        try {
            const logs = await documentEditJobLogService.getByJobId(req.params.jobId);
            return res.status(200).json(logs);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new DocumentEditJobLogController();