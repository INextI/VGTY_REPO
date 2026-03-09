// controllers/documentAttachmentController.js
const documentAttachmentService = require('../services/documentAttachmentService');

class DocumentAttachmentController {
    async create(req, res, next) {
        try {
            const attachment = await documentAttachmentService.create(req.body);
            return res.status(201).json(attachment);
        } catch (e) {
            next(e);
        }
    }

    async getAll(req, res, next) {
        try {
            const attachments = await documentAttachmentService.getAll();
            return res.status(200).json(attachments);
        } catch (e) {
            next(e);
        }
    }
    async getById(req, res, next) {
        try {
            const attachment = await documentAttachmentService.getById(req.params.id);
            if (!attachment) {
                return res.status(404).json({ message: 'Вложение документа не найдено' });
            }
            return res.status(200).json(attachment);
        } catch (e) {
            next(e);
        }
    }

    async update(req, res, next) {
        try {
            const attachment = await documentAttachmentService.update(req.params.id, req.body);
            if (!attachment) {
                return res.status(404).json({ message: 'Вложение документа не найдено' });
            }
            return res.status(200).json(attachment);
        } catch (e) {
            next(e);
        }
    }

    async delete(req, res, next) {
        try {
            const result = await documentAttachmentService.delete(req.params.id);
            if (!result) {
                return res.status(404).json({ message: 'Вложение документа не найдено' });
            }
            return res.status(204).send();
        } catch (e) {
            next(e);
        }
    }

    async getByDepartmentId(req, res, next) {
        try {
            const attachments = await documentAttachmentService.getByDepartmentId(req.params.departmentId);
            return res.status(200).json(attachments);
        } catch (e) {
            next(e);
        }
    }

    async getByDisciplineId(req, res, next) {
        try {
            const attachments = await documentAttachmentService.getByDisciplineId(req.params.disciplineId);
            return res.status(200).json(attachments);
        } catch (e) {
            next(e);
        }
    }

    async getBySessionId(req, res, next) {
        try {
            const attachments = await documentAttachmentService.getBySessionId(req.params.sessionId);
            return res.status(200).json(attachments);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new DocumentAttachmentController();