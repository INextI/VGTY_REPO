const eduProgrammService = require('../services/eduProgrammService')

class EduProgrammController {
    async create(req, res, next) {
        try{
            const programm = await eduProgrammService.createEduProgramm(req.body)
            return res.status(201).json(programm)
        } catch (e) {
            next(e)
        }
    }

    async getAll(req,res, next) {
        try {
            const programm = await eduProgrammService.getAllEduProgramms()
            return res.json(programm)
        } catch (e) {
            next(e)
        }
    }

    async getOne(req, res, next) {
        try {
            const programm = await eduProgrammService.getEduProgrammById(req.params.id)
            return res.json(programm)
        } catch (e) {
            next(e)
        }
    }

    async update(req, res, next) {
        try {
            const programm = await eduProgrammService.updateEduProgramm(req.params.id, req.body)
            return res.json(programm)
        } catch (e) {
            next(e)
        }
    }

    async delete(req, res, next) {
        try {
            const programm = await eduProgrammService.deleteEduProgramm(req.params.id)
            return res.json(programm)
        } catch (e) {
            next(e)
        }
    }
}


module.exports = new EduProgrammController()