// controllers/documentTypeController.js
const documentTypeService = require('../services/documentTypeService');

class DocumentTypeController {
    async create(req, res, next) {
        try {
            const type = await documentTypeService.create(req.body);
            return res.status(201).json(type);
        } catch (e) {
            next(e);
        }
    }

    async getAll(req, res, next) {
        try {
            const types = await documentTypeService.getAll();
            return res.status(200).json(types);
        } catch (e) {
            next(e);
        }
    }

   


    async getById(req, res, next) {
        try {
            const type = await documentTypeService.getById(req.params.id);
            if (!type) {
                return res.status(404).json({ message: 'Тип документа не найден' });
            }
            return res.status(200).json(type);
        } catch (e) {
            next(e);
        }
    }

    async update(req, res, next) {
        try {
            const type = await documentTypeService.update(req.params.id, req.body);
            if (!type) {
                return res.status(404).json({ message: 'Тип документа не найден' });
            }
            return res.status(200).json(type);
        } catch (e) {
            next(e);
        }
    }

    async delete(req, res, next) {
        try {
            const result = await documentTypeService.delete(req.params.id);
            if (!result) {
                return res.status(404).json({ message: 'Тип документа не найден' });
            }
            return res.status(204).send();
        } catch (e) {
            next(e);
        }
    }

    
}


 exports.getAll = async (req, res) => {
    try {
        const types = await documentTypeService.getAll();
        res.json(types); // Важно: возвращаем массив напрямую
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    };

module.exports = new DocumentTypeController();