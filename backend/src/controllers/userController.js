// controllers/userController.js
const { User, Role, Student, Employee, Group, FacultyModel, EducationForm, EmployeeGrades }
    = require('../models');
const bcrypt = require('bcrypt');
// Импортируем экземпляр sequelize из конфигурации
const sequelize = require('../config/db');

const userService = require('../services/userService')
class UserController {
    /*
    // Создание полного пользователя (с дополнительными данными)
    async createFullUser(req, res) {
        const transaction = await sequelize.transaction();
        try {
            const {
                login,
                password,
                role_id,
                role_code, // дополнительный параметр для проверки
                first_name,
                last_name,
                patronymic,
                birth_date,
                // Поля для студента
                group_id,
                faculty_id,
                education_form_id,
                // Поля для преподавателя
                grade_id
            } = req.body;
            // Валидация обязательных полей
            if (!login || !password || !role_id || !first_name || !last_name) {
                await transaction.rollback();
                return res.status(400).json({
                    message: 'Заполните все обязательные поля: логин, пароль, роль, имя, фамилия'
                });
            }
            // Проверяем существование логина
            const existingUser = await User.findOne({
                where: { login },
                transaction
            });
            if (existingUser) {
                await transaction.rollback();
                return res.status(400).json({
                    message: 'Пользователь с таким логином уже существует'
                });
            }
            // Получаем роль
            const role = await Role.findOne({
                where: { id: role_id },
                transaction
            });
            if (!role) {
                await transaction.rollback();
                return res.status(400).json({
                    message: 'Указанная роль не найдена'
                });
            }
            // Дополнительная проверка по коду роли (если передан)
            if (role_code && role.code !== role_code) {
                await transaction.rollback();
                return res.status(400).json({
                    message: 'Несоответствие кода роли'
                });
            }
            // Хешируем пароль
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);
            // Создаем пользователя
            const user = await User.create({
                login,
                password_hash: passwordHash,
                role_id: role.id,
                is_active: true
            }, { transaction });
            // Создаем профиль пользователя
            const profileData = {
                user_id: user.id,
                first_name,
                last_name,
                patronymic: patronymic || null,
                birth_date: birth_date || null
            };
            // В зависимости от роли создаем дополнительные записи
            if (role.code === 'student') {
                // Валидация для студента
                if (!group_id || !faculty_id || !education_form_id) {
                    await transaction.rollback();
                    return res.status(400).json({
                        message: 'Для студента необходимо указать группу, факультет и форму обучения'
                    });
                }
                // Проверяем существование группы
                const group = await Group.findOne({
                    where: { id: group_id },
                    transaction
                });
                if (!group) {
                    await transaction.rollback();
                    return res.status(400).json({
                        message: 'Указанная группа не найдена'
                    });
                }
                // Проверяем существование факультета
                const faculty = await FacultyModel.findOne({
                    where: { id: faculty_id },
                    transaction
                });
                if (!faculty) {
                    await transaction.rollback();
                    return res.status(400).json({
                        message: 'Указанный факультет не найден'
                    });
                }
                // Проверяем существование формы обучения
                const educationForm = await EducationForm.findOne({
                    where: { id: education_form_id },
                    transaction
                });
                if (!educationForm) {
                    await transaction.rollback();
                    return res.status(400).json({
                        message: 'Указанная форма обучения не найдена'
                    });
                }
                // Создаем запись студента
                await Student.create({
                    ...profileData,
                    group_id: group.id,
                    faculty_id: faculty.id,
                    education_form_id: educationForm.id
                }, { transaction });
            } else if (role.code === 'teacher') {
                // Для преподавателя проверяем факультет (если указан)
                if (faculty_id) {
                    const faculty = await FacultyModel.findOne({
                        where: { id: faculty_id },
                        transaction
                    });
                    if (!faculty) {
                        await transaction.rollback();
                        return res.status(400).json({
                            message: 'Указанный факультет не найден'
                        });
                    }
                }
                // Для преподавателя проверяем ученое звание (если указано)
                if (grade_id) {
                    const grade = await EmployeeGrades.findOne({
                        where: { id: grade_id },
                        transaction
                    });
                    if (!grade) {
                        await transaction.rollback();
                        return res.status(400).json({
                            message: 'Указанное ученое звание не найдено'
                        });
                    }
                }
                // Создаем запись преподавателя
                await Employee.create({
                    ...profileData,
                    faculty_id: faculty_id || null,
                    grade_id: grade_id || null
                }, { transaction });
            } else if (role.code === 'admin') {
                // Для администратора создаем запись в таблице Employee
                await Employee.create({
                    ...profileData,
                    faculty_id: null,
                    grade_id: null
                }, { transaction });
            }
            // Фиксируем транзакцию
            await transaction.commit();
            // Возвращаем успешный ответ
            return res.status(201).json({
                message: 'Пользователь успешно создан',
                user: {
                    id: user.id,
                    login: user.login,
                    role: {
                        id: role.id,
                        name: role.name,
                        code: role.code
                    },
                    first_name,
                    last_name,
                    patronymic,
                    birth_date
                }
            });
        } catch (error) {
            // Откатываем транзакцию при ошибке
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.error('Ошибка создания пользователя:', error);
            // Обработка специфичных ошибок Sequelize
            if (error.name === 'SequelizeValidationError') {
                const messages = error.errors.map(err => err.message);
                return res.status(400).json({
                    message: 'Ошибка валидации',
                    errors: messages
                });
            }
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({
                    message: 'Нарушение уникальности данных'
                });
            }
            return res.status(500).json({
                message: 'Внутренняя ошибка сервера',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    
    // Получение списка пользователей
    async getUsers(req, res) {
        try {
            const users = await User.findAll({
                include: [
                    {
                        model: Role, as: 'role'
                    }
                ],
                attributes: ['id', 'login', 'is_active', 'last_login', 'createdAt']
            });
            return res.json(users);
        } catch (error) {
            console.error('Ошибка получения пользователей:', error);
            return res.status(500).json({
                message: 'Ошибка получения списка пользователей'
            });
        }
    }
    // Получение пользователя по ID
    async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findOne({
                where: { id },
                include: [
                    {
                        model: Role,
                        attributes: ['id', 'name', 'code']
                    },
                    {
                        model: Student,
                        include: [Group, FacultyModel, EducationForm]
                    },
                    {
                        model: Employee,
                        include: [FacultyModel, EmployeeGrades]
                    }
                ]
            });
            if (!user) {
                return res.status(404).json({
                    message: 'Пользователь не найден'
                });
            }
            return res.json(user);
        } catch (error) {
            console.error('Ошибка получения пользователя:', error);
            return res.status(500).json({
                message: 'Ошибка получения данных пользователя'
            });
        }
    }

    */

    async create(req, res, next) {
        try{
            const user = await userService.createUser(req.body)
            return res.status(201).json(user)
        } catch (e) {
            next(e)
        }
    }

    async getAll(req,res, next) {
        try {
            const users = await userService.getAllUsers()
            return res.json(users)
        } catch (e) {
            next(e)
        }
    }

    async getOne(req, res, next) {
        try {
            const user = await userService.getUserById(req.params.id)
            return res.json(user)
        } catch (e) {
            next(e)
        }
    }

    async update(req, res, next) {
        try {
            const user = await userService.updateUser(req.params.id, req.body)
            return res.json(user)
        } catch (e) {
            next(e)
        }
    }

    async delete(req, res, next) {
        try {
            const result = await userService.deleteUser(req.params.id)
            return res.json(result)
        } catch (e) {
            next(e)
        }
    }

    async createFull(req, res, next) {
        try {
            const user = await userService.createFullUser(req.body);
            return res.status(201).json(user);
        } catch (e) {
            next(e);
        }
    }

}


module.exports = new UserController()