const Student = require('../models/studentModel')

class StudentService {
    async createStudent(data) {
        return await Student.create(data)
    }

    async getAllStudents() {
        return await Student.findAll()
    }

    async getStudentById(id) {
        return await Student.findByPk(id)
    }

    async updateStudent(id, data) {
        const user = await findByPk(id)
        if (!user) throw new Error("Пользователь не найден")    // НАПИСАТЬ ПОТОМ ОШИБКУ ОТДЕЛЬНО

        return await user.update(data)
    }

    async deleteStudent(id) {
        const user = await findByPk(id)
        if (!user) throw new Error("Пользователь не найден")    // НАПИСАТЬ ПОТОМ ОШИБКУ ОТДЕЛЬНО

        await user.destroy()
        return { message: 'Удален'}
    }
}

module.exports = new StudentService()