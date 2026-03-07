const Student = require('../models/studentModel')

const disciplineService = require('./disciplineService');

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
        const user = await Student.findByPk(id)
        if (!user) throw new Error("Пользователь не найден")    // НАПИСАТЬ ПОТОМ ОШИБКУ ОТДЕЛЬНО

        return await user.update(data)
    }

    async deleteStudent(id) {
        const user = await Student.findByPk(id)
        if (!user) throw new Error("Пользователь не найден")    // НАПИСАТЬ ПОТОМ ОШИБКУ ОТДЕЛЬНО

        await user.destroy()
        return { message: 'Удален'}
    }

    async getStudentByUserId(userId) {
        const student = await Student.findOne({
            where: {user_id: userId}
        });

        if (!student) {
            throw new Error("Студент не найден")
        }

        return student;
    }

    async getStudentDisciplines(userId, pagination) {
        const student = await this.getStudentByUserId(userId);

        return disciplineService.getDisciplineByGroup( student.group_id, pagination);
    }
}

module.exports = new StudentService()