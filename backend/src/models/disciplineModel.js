const sequelize = require('../config/db')
const {DataTypes} = require('sequelize')

const Discipline = sequelize.define('descipline',{
    id: {type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4},
    name: {type: DataTypes.STRING, allowNull: false},
    department_id: {type: DataTypes.UUID},
    education_form_id: {type: DataTypes.UUID}
},{
    tableName: 'disciplines',
    timestamps: true,
    updatedAt: false
})

module.exports = Discipline

/*

// Получение дисциплин для студента (через программу обучения его группы)
const findDisciplinesByStudentId = async (userId) => {
    const query = `
        SELECT DISTINCT d.* FROM disciplines d
        JOIN edu_program_disciplines epd ON d.id = epd.discipline_id
        JOIN edu_programs ep ON epd.edu_program_id = ep.id
        JOIN groups g ON ep.id = g.program_id
        JOIN students s ON g.id = s.group_id
        WHERE s.user_id = $1
    `;
    const { rows } = await db.query(query, [userId]);
    return rows;
};

// Получение дисциплин для преподавателя (через таблицу сессий)
const findDisciplinesByTeacherId = async (userId) => {
    const query = `
        SELECT DISTINCT d.* FROM disciplines d
        JOIN sessions s ON d.id = s.discipline_id
        JOIN employees e ON s.teacher_id = e.id
        WHERE e.user_id = $1
    `;
    const { rows } = await db.query(query, [userId]);
    return rows;
};

const createDiscipline = async (title) => {
    const query = `
        INSERT INTO disciplines (name)
        VALUES ($1)
        RETURNING *
    `;
    const { rows } = await db.query(query, [title]);
    return rows[0];
};

const findDisciplineById = async (disciplineId) => {
    const query = 'SELECT * FROM disciplines WHERE id = $1';
    const { rows } = await db.query(query, [disciplineId]);
    return rows[0];
};

const updateDiscipline = async (disciplineId, title) => {
    const query = `
        UPDATE disciplines 
        SET name = $1
        WHERE id = $2
        RETURNING *
    `;
    const { rows } = await db.query(query, [title, disciplineId]);
    return rows[0];
};

const deleteDiscipline = async (disciplineId) => {
    const query = 'DELETE FROM disciplines WHERE id = $1 RETURNING *';
    const { rows } = await db.query(query, [disciplineId]);
    return rows[0];
};

const findAllDisciplines = async () => {
    const query = 'SELECT * FROM disciplines ORDER BY name ASC';
    const { rows } = await db.query(query);
    return rows;
};

module.exports = {
    findDisciplinesByStudentId,
    findDisciplinesByTeacherId,
    createDiscipline,
    findDisciplineById,
    updateDiscipline,
    deleteDiscipline,
    findAllDisciplines
};

*/