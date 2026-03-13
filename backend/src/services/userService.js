const sequelize = require('../config/db');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const Student = require('../models/studentModel');
const Employee = require('../models/employeeModel');
const Role = require('../models/roleModel')

const authService = require('./authService')
const roleService = require('./roleService')
const groupService = require('./groupService')
const educationFormService = require('./educationFormService')
const facultyService = require('./facultyServices')
const studentService = require('./studentService')
const employeeService = require('./employeeService')


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

            let faculty

            if (data.faculty.id) {
                faculty = await facultyService.getFacultyById(data.faculty.id)
            }
            if (data.faculty.name) {
                faculty = await facultyService.getFacultyByName(data.faculty.name)
            }

            // Если это студент
            if (role.name === 'student') {
                let group
                if (data.group.id) {
                    group = await groupService.getGroupById(data.group.id)
                }
                if (data.group.name) {
                    group = await groupService.getGroupByName(data.group.name)
                }
                let eduForm
                if (data.education_form.id) {
                    eduForm = await educationFormService.getEducationFormById(data.education_form.id)
                }
                if (data.education_form.name) {
                    eduForm = await educationFormService.getEducationFormByName(data.education_form.name)
                }
                await Student.create({
                    user_id: user.id,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    patronymic: data.patronymic,
                    birth_date: data.birth_date,
                    faculty_id: faculty.id,
                    group_id: group.id,
                    education_form_id: eduForm.id
                }, { transaction: t });
            }

            // Если это сотрудник
            if (role.name === 'employee') {
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

    async getUserDisciplines(userId, pagination) {

        const user = await User.findByPk(userId, {
            include: {
                model: Role,
                as: "role"
            }
        });

        if (!user) {
            throw new Error("Пользователь не найден");
        }

        const role = user.role.name;

        if (role === "student") {
            return studentService.getStudentDisciplines(userId, pagination);
        }

        if (role === "employee") {
            return employeeService.getEmployeeDiscipline(userId, pagination);
        }

        if (role === "admin") {
            throw new Error("Администратор не привязан к дисциплинам");
        }

    }
}

module.exports = new UserService()