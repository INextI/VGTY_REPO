// controllers/documentEditJobController.js
const documentEditJobService = require('../services/documentEditJobService');

class DocumentEditJobController {
    async create(req, res, next) {
        try {
            const job = await documentEditJobService.create(req.body);
            return res.status(201).json(job);
        } catch (e) {
            next(e);
        }
    }

    async getAll(req, res, next) {
        try {
            const jobs = await documentEditJobService.getAll();
            return res.status(200).json(jobs);
        } catch (e) {
            next(e);
        }
    }

    async getById(req, res, next) {
        try {
            const job = await documentEditJobService.getById(req.params.id);
            if (!job) {
                return res.status(404).json({ message: 'Задание на редактирование не найдено' });
            }
            return res.status(200).json(job);
        } catch (e) {
            next(e);
        }
    }
    async update(req, res, next) {
        try {
            const job = await documentEditJobService.update(req.params.id, req.body);
            if (!job) {
                return res.status(404).json({ message: 'Задание на редактирование не найдено' });
            }
            return res.status(200).json(job);
        } catch (e) {
            next(e);
        }
    }

    async delete(req, res, next) {
        try {
            const result = await documentEditJobService.delete(req.params.id);
            if (!result) {
                return res.status(404).json({ message: 'Задание на редактирование не найдено' });
            }
            return res.status(204).send();
        } catch (e) {
            next(e);
        }
    }

    async updateStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            const job = await documentEditJobService.updateStatus(id, status);
            if (!job) {
                return res.status(404).json({ message: 'Задание на редактирование не найдено' });
            }
            return res.status(200).json(job);
        } catch (e) {
            next(e);
        }
    }

    async getByStatus(req, res, next) {
        try {
            const jobs = await documentEditJobService.getByStatus(req.params.status);
            return res.status(200).json(jobs);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new DocumentEditJobController();
