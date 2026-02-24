const educationFormService = require('../services/educationFormService')

class EducationFormController {
    async create(req, res, next) {
        try{
            const eduForm = await educationFormService.createEducationForm(req.body)
            return res.status(201).json(faculty)
        } catch (e) {
            next(e)
        }
    }

    async getAll(req,res, next) {
        try {
            const eduForm = await educationFormService.getAllEducationForms()
            return res.json(facultys)
        } catch (e) {
            next(e)
        }
    }

    async getOne(req, res, next) {
        try {
            const eduForm = await educationFormService.getEducationFormById(req.params.id)
            return res.json(faculty)
        } catch (e) {
            next(e)
        }
    }

    async update(req, res, next) {
        try {
            const eduForm = await educationFormService.updateEducationForm(req.params.id, req.body)
            return res.json(faculty)
        } catch (e) {
            next(e)
        }
    }

    async delete(req, res, next) {
        try {
            const eduForm = await educationFormService.deleteEducationForm(req.params.id)
            return res.json(result)
        } catch (e) {
            next(e)
        }
    }
}


module.exports = new EduProgrammController()