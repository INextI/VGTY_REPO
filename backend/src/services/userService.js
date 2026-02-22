const sequelize = require('../config/db');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const Student = require('../models/studentModel');
const Employee = require('../models/employeeModel');

const authService = require('./authService')




class UserService {
    async createUser(data) {
        return await User.create(data)
    }

    async getAllUsers() {
        return await User.findAll()
    }

    async getUserById(id) {
        return await User.findByPk(id)
    }

    async updateUser(id, data) {
        const user = await findByPk(id)
        if (!user) throw new Error("Пользователь не найден")    // НАПИСАТЬ ПОТОМ ОШИБКУ ОТДЕЛЬНО

        return await user.update(data)
    }

    async deleteUser(id) {
        const user = await findByPk(id)
        if (!user) throw new Error("Пользователь не найден")    // НАПИСАТЬ ПОТОМ ОШИБКУ ОТДЕЛЬНО

        await user.destroy()
        return { message: 'Удален'}
    }

    async createFullUser(data) {
        return await sequelize.transaction(async (t) => {
            // Создаём пользователя
            const passwordHash = await authService.hashPassword(data.password)
            const user = await User.create({
                login: data.login,
                password_hash: passwordHash,
                role: data.role,
            }, { transaction: t });

            // Если это студент
            if (data.role === 'student') {
                await Student.create({
                    user_id: user.id,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    patronymic: data.patronymic,
                    birth_date: data.birth_date,
                    group_id: data.group_id,
                    education_form_id: data.education_form_id
                }, { transaction: t });
            }

            // Если это сотрудник
            if (data.role === 'employee') {
                await Employee.create({
                    user_id: user.id,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    patronymic: data.patronymic,
                    birth_date: data.birth_date,
                    role_id: data.role_id,
                    department_id: data.department_id,
                    grade_id: data.grade_id
                }, { transaction: t });
            }

            return user;
        });
    }
}

module.exports = new UserService()