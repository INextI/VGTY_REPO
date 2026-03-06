const sequelize = require('../config/db');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const Student = require('../models/studentModel');
const Employee = require('../models/employeeModel');

const authService = require('./authService')
const roleService = require('./roleService')
const groupService = require('./groupService')
const educationFormService = require('./educationFormService')
const facultyService = require('./facultyServices')


class UserService {
    async createUser(data) {
        const passwordHash = await authService.hashPassword(data.password)
        const role = await roleService.getRoleByName(data.role_name)
        return await User.create({
            login: data.login,
            password_hash: passwordHash,
            role_id: role.id
        })
    }

    async getAllUsers() {
        return await User.findAll()
    }

    async getUserById(id) {
        return await User.findByPk(id)
    }

    async updateUser(id, data) {
        const user = await User.findByPk(id)
        if (!user) throw new Error("Пользователь не найден")    // НАПИСАТЬ ПОТОМ ОШИБКУ ОТДЕЛЬНО

        return await user.update(data)
    }

    async deleteUser(id) {
        const user = await User.findByPk(id)
        if (!user) throw new Error("Пользователь не найден")    // НАПИСАТЬ ПОТОМ ОШИБКУ ОТДЕЛЬНО

        await user.destroy()
        return { message: 'Удален'}
    }

    async createFullUser(data) {
        return await sequelize.transaction(async (t) => {
            // Создаём пользователя
            const role = await roleService.getRoleByName(data.role)

            const passwordHash = await authService.hashPassword(data.password)
            const user = await User.create({
                login: data.login,
                password_hash: passwordHash,
                role_id: role.id,
            }, { transaction: t });


            // Если это студент
            if (role.name === 'student') {
                const group = await groupService.getGroupByName(group_name)
                const eduForm = await educationFormService.getEducationFormByName(education_form_name)
                await Student.create({
                    user_id: user.id,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    patronymic: data.patronymic,
                    birth_date: data.birth_date,
                    group_id: group.id,
                    education_form_id: eduForm.id
                }, { transaction: t });
            }

            // Если это сотрудник
            if (role.name === 'employee') {
                const faculty = await facultyService.getFacultyByName(faculty_name)
                await Employee.create({
                    user_id: user.id,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    patronymic: data.patronymic,
                    birth_date: data.birth_date,
                    faculty_id: faculty.id,
                }, { transaction: t });
            }

            return user;
        });
    }
}

module.exports = new UserService()