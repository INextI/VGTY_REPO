const studentService = require('../services/studentService')

class StudentController {
    async create(req, res, next) {
        try{
            const user = await studentService.createStudent(req.body)
            return res.status(201).json(user)
        } catch (e) {
            next(e)
        }
    }

    async getAll(req,res, next) {
        try {
            const users = await studentService.getAllStudents()
            return res.json(users)
        } catch (e) {
            next(e)
        }
    }

    async getOne(req, res, next) {
        try {
            const user = await studentService.getStudentById(req.params.id)
            return res.json(user)
        } catch (e) {
            next(e)
        }
    }

    async update(req, res, next) {
        try {
            const user = await studentService.updateStudent(req.params.id, req.body)
            return res.json(user)
        } catch (e) {
            next(e)
        }
    }

    async delete(req, res, next) {
        try {
            const result = await studentService.deleteStudent(req.params.id)
            return res.json(result)
        } catch (e) {
            next(e)
        }
    }
}


module.exports = new StudentController()