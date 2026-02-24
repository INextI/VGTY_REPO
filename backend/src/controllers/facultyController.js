const facultyService = require('../services/facultyServices')

class FacultyController {
    async create(req, res, next) {
        try{
            const faculty = await facultyService.createFaculty(req.body)
            return res.status(201).json(faculty)
        } catch (e) {
            next(e)
        }
    }

    async getAll(req,res, next) {
        try {
            const facultys = await facultyService.getAllFacultys()
            return res.json(facultys)
        } catch (e) {
            next(e)
        }
    }

    async getOne(req, res, next) {
        try {
            const faculty = await facultyService.getFacultyById(req.params.id)
            return res.json(faculty)
        } catch (e) {
            next(e)
        }
    }

    async update(req, res, next) {
        try {
            const faculty = await facultyService.updateFaculty(req.params.id, req.body)
            return res.json(faculty)
        } catch (e) {
            next(e)
        }
    }

    async delete(req, res, next) {
        try {
            const result = await facultyService.deleteFaculty(req.params.id)
            return res.json(result)
        } catch (e) {
            next(e)
        }
    }
}


module.exports = new FacultyController()