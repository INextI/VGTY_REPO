const academicYear = require('../services/academicYearService')

class AcademicYearController {
    async create(req, res, next) {
        try{
            const year = await academicYear.createAcademicYear(req.body)
            return res.status(201).json(year)
        } catch (e) {
            next(e)
        }
    }

    async getAll(req,res, next) {
        try {
            const year = await academicYear.getAllAcademicYears()
            return res.json(year)
        } catch (e) {
            next(e)
        }
    }

    async getOne(req, res, next) {
        try {
            const year = await academicYear.getAcademicYearById(req.params.id)
            return res.json(year)
        } catch (e) {
            next(e)
        }
    }

    async delete(req, res, next) {
        try {
            const result = await academicYear.deleteAcademicYear(req.params.id)
            return res.json(result)
        } catch (e) {
            next(e)
        }
    }
}


module.exports = new AcademicYearController()