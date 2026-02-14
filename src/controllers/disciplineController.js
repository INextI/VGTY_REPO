const disciplineModel = require('../models/disciplineModel');

const getMyDisciplines = async (req, res) => {
    try {
        const { userId, role } = req.user;
        let disciplines;

        if (role === 'student') {
            disciplines = await disciplineModel.findDisciplinesByStudentId(userId);
        } else if (role === 'teacher') {
            disciplines = await disciplineModel.findDisciplinesByTeacherId(userId);
        } else {
            disciplines = await disciplineModel.findAllDisciplines();
        }

        res.status(200).json(disciplines);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера при получении ваших курсов' });
    }
};

const getAllDisciplines = async (req, res) => {
    try {
        const disciplines = await disciplineModel.findAllDisciplines();
        res.status(200).json(disciplines);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

const getDisciplineById = async (req, res) => {
    try {
        const discipline = await disciplineModel.findDisciplineById(req.params.id);
        if (!discipline) return res.status(404).json({ message: 'Курс не найден' });
        res.status(200).json(discipline);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

const createDiscipline = async (req, res) => {
    try {
        const { title } = req.body; // 'title' приходит из инпута "Название курса"
        if (!title) return res.status(400).json({ message: 'Название курса обязательно' });

        const newDiscipline = await disciplineModel.createDiscipline(title);
        res.status(201).json(newDiscipline);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ message: 'Курс с таким названием уже существует' });
        }
        res.status(500).json({ message: 'Ошибка при создании курса' });
    }
};

const updateDiscipline = async (req, res) => {
    try {
        const { title } = req.body;
        const updated = await disciplineModel.updateDiscipline(req.params.id, title);
        if (!updated) return res.status(404).json({ message: 'Курс не найден' });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при обновлении' });
    }
};

const deleteDiscipline = async (req, res) => {
    try {
        const deleted = await disciplineModel.deleteDiscipline(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Курс не найден' });
        res.status(200).json({ message: 'Курс успешно удален' });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при удалении' });
    }
};

module.exports = {
    getMyDisciplines,
    getAllDisciplines,
    getDisciplineById,
    createDiscipline,
    updateDiscipline,
    deleteDiscipline,
};






/*const courseModel = require('../models/courseModel');

const getMyCourses = async (req, res) => {
    try {
        // req.user.userId пришел из токена
        const courses = await courseModel.findCoursesByStudentId(req.user.userId);
        res.json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера при получении курсов' });
    }
};

const createCourse = async (req, res) => {
    try {
        const { title, description } = req.body;
        const teacherUserId = req.user.userId;

        if (!title || !description) {
            return res.status(400).json({ message: 'Название и описание курса обязательны.' });
        }

        const newCourse = await courseModel.createCourse(title, description, teacherUserId);

        res.status(201).json(newCourse);
    } catch (error) {
        console.error('Ошибка при создании курса:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};


const updateCourse = async (req, res) => {
    try {
        const courseId = parseInt(req.params.id, 10);
        const { title, description } = req.body;
        const { userId, role } = req.user;

        const course = await courseModel.findCourseById(courseId);

        if (!course) {
            return res.status(404).json({ message: 'Курс не найден' });
        }

        if (course.teacher_id !== userId && role !== 'admin') {
            return res.status(403).json({ message: 'Доступ запрещен: вы не являетесь автором этого курса.' });
        }

        const updatedCourse = await courseModel.updateCourse(courseId, title, description);
        res.json(updatedCourse);

    } catch (error) {
        console.error('Ошибка при обновлении курса:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const courseId = parseInt(req.params.id, 10);
        const { userId, role } = req.user;

        const course = await courseModel.findCourseById(courseId);

        if (!course) {
            return res.status(404).json({ message: 'Курс не найден' });
        }

        if (course.teacher_id !== userId && role !== 'admin') {
            return res.status(403).json({ message: 'Доступ запрещен: вы не являетесь автором этого курса.' });
        }

        await courseModel.deleteCourse(courseId);

        res.status(200).json({ message: 'Курс успешно удален.' });

    } catch (error) {
        console.error('Ошибка при удалении курса:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

const getAllCourses = async (req, res) => {
    try {
        const courses = await courseModel.findAllCourses();
        res.json(courses);
    } catch (error) {
        console.error('Ошибка при получении всех курсов:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

const getCourseById = async (req, res) => {
    try {
        const courseId = parseInt(req.params.id, 10);
        const course = await courseModel.findCourseById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Курс не найден' });
        }
        res.json(course);
    } catch (error) {
        console.error('Ошибка при получении курса по ID:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};


module.exports = {
    getMyCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getAllCourses,
    getCourseById
};*/
