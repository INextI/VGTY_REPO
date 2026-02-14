// 1. Импортируем все наши модели
const sequelize = require('../config/db');
const User = require('./users');
const Student = require('./Student');
const Employee = require('./Employee');
const Department = require('./Department');
const Group = require('./Group');
const Discipline = require('./Discipline');
const GroupDiscipline = require('./GroupDiscipline'); // Важно импортировать и связующую модель!

// 2. Описываем связи

// Связь "Один-к-Одному": User <-> Student
// У одного User есть один профиль Student.
User.hasOne(Student, { foreignKey: 'user_id', onDelete: 'CASCADE' });
// Профиль Student принадлежит одному User.
Student.belongsTo(User, { foreignKey: 'user_id' });

// Связь "Один-к-Одному": User <-> Employee
User.hasOne(Employee, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Employee.belongsTo(User, { foreignKey: 'user_id' });

// Связь "Один-ко-Многим": Department -> Employees
// У одной Кафедры может быть много Сотрудников.
Department.hasMany(Employee, { foreignKey: 'department_id', onDelete: 'SET NULL' });
// Сотрудник принадлежит одной Кафедре.
Employee.belongsTo(Department, { foreignKey: 'department_id' });

// Связь "Один-ко-Многим": Group -> Students
Group.hasMany(Student, { foreignKey: 'group_id', onDelete: 'SET NULL' });
Student.belongsTo(Group, { foreignKey: 'group_id' });

// === Связь "Многие-ко-Многим": Group <-> Discipline ===
// Это самая сложная связь. Она реализуется через промежуточную таблицу 'group_disciplines'.
Group.belongsToMany(Discipline, {
    through: GroupDiscipline,      // Указываем, через какую МОДЕЛЬ идет связь
    foreignKey: 'group_id',        // Внешний ключ в таблице 'group_disciplines', который ссылается на Group
    otherKey: 'discipline_id'      // Внешний ключ в таблице 'group_disciplines', который ссылается на Discipline
});
Discipline.belongsToMany(Group, {
    through: GroupDiscipline,      // Та же самая промежуточная модель
    foreignKey: 'discipline_id',
    otherKey: 'group_id'
});

// 3. Экспортируем все модели и подключение в одном объекте для удобного импорта в других частях приложения
module.exports = {
    sequelize,
    User,
    Student,
    Employee,
    Department,
    Group,
    Discipline,
    GroupDiscipline
};
