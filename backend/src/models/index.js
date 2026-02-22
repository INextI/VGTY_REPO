
const sequelize = require('../config/db')

//таблы
const User = require('./userModel');
const Student = require('./studentModel');
const Employee = require('./employeeModel');
const Department = require('./departmentModel');
const Group = require('./groupModel');
const Discipline = require('./disciplineModel');
const EducationForm = require('./educationFormModel')
const EduProgramm = require('./eduProgrammModel')
const Token = require('./tokenModel');
const Role = require('./roleModel')
const DisciplineEmployee = require('./disciplineEmployeeModel')

//таблы для связи
const GroupDiscipline = require('./groupDisciplineModel');

//связи

// Связь "Один-к-Одному": User <-> Student
User.hasOne(Student, { foreignKey: 'user_id', onDelete: 'CASCADE' })
Student.belongsTo(User, { foreignKey: 'user_id' })

// Связь "Один-к-Одному": User <-> Employee
User.hasOne(Employee, { foreignKey: 'user_id', onDelete: 'CASCADE' })
Employee.belongsTo(User, { foreignKey: 'user_id' })

//User ↔ Role (Многие к одному)
Role.hasMany(User, { foreignKey: 'role_id' })
User.belongsTo(Role, { foreignKey: 'role_id' })

// Связь "Один-ко-Многим": Department -> Employees
Department.hasMany(Employee, { foreignKey: 'department_id' })
Employee.belongsTo(Department, { foreignKey: 'department_id' })

// Связь "Один-ко-Многим": Group -> Students
Group.hasMany(Student, { foreignKey: 'group_id' })
Student.belongsTo(Group, { foreignKey: 'group_id' })

//Student ↔ EducationForm (Многие к одному)
EducationForm.hasMany(Student, { foreignKey: 'education_form_id' })
Student.belongsTo(EducationForm, { foreignKey: 'education_form_id' })

//Group ↔ EduProgram (Многие к одному)
EduProgramm.hasMany(Group, { foreignKey: 'edu_program_id' })
Group.belongsTo(EduProgramm, { foreignKey: 'edu_program_id' })

// Связь "Один-к-Одному": Group ↔ Employee
Employee.hasMany(Group, { foreignKey: 'curator_id', as: 'CuratedGroups' })
Group.belongsTo(Employee, { foreignKey: 'curator_id', as: 'Curator' })

// Связь "Один-к-Одному": EduProgram ↔ Department
Department.hasMany(EduProgramm, { foreignKey: 'department_id' })
EduProgramm.belongsTo(Department, { foreignKey: 'department_id' })

// Связь "Один-к-Одному": EduProgram ↔ EducationForm
EducationForm.hasMany(EduProgramm, { foreignKey: 'education_form_id' })
EduProgramm.belongsTo(EducationForm, { foreignKey: 'education_form_id' })

// Связь "Один-к-Одному": Discipline ↔ Department
Department.hasMany(Discipline, { foreignKey: 'department_id' })
Discipline.belongsTo(Department, { foreignKey: 'department_id' })

// Связь "Один-к-Одному": Discipline ↔ EducationForm
EducationForm.hasMany(Discipline, { foreignKey: 'education_form_id' })
Discipline.belongsTo(EducationForm, { foreignKey: 'education_form_id' })

// Связь "Один-к-Одному": User ↔ Token
User.hasOne(Token, {foreignKey: 'user_id', onDelete: 'CASCADE'})
Token.belongsTo(User, { foreignKey: 'user_id'})

// Связь "Один-ко-Многим": Employee -> Discipline
Discipline.belongsTo(Employee, {foreignKey: 'owner_employee_id', as: 'owner'})
Employee.hasMany(Discipline, {foreignKey: 'owner_employee_id', as: 'owned_disciplines'})

// === Связь "Многие-ко-Многим": Group <-> Discipline ===
Group.belongsToMany(Discipline, {
   through: GroupDiscipline,
   foreignKey: 'group_id',
   otherKey: 'discipline_id'
})

Discipline.belongsToMany(Group, {
   through: GroupDiscipline,
   foreignKey: 'discipline_id',
   otherKey: 'group_id'
})

// === Связь "Многие-ко-Многим": Discipline <-> Employee ===
Discipline.belongsToMany(Employee, {
   through: DisciplineEmployee,
   foreignKey: 'discipline_id',
   otherKey: 'employee_id',
   as: 'connected_employees'
})

Employee.belongsToMany(Discipline, {
   through: DisciplineEmployee,
   foreignKey: 'employee_id',
   otherKey: 'discipline_id',
   as: 'connected_disciplines'
})

module.exports = {
    User,
    Student,
    Employee,
    Department,
    Group,
    Discipline, 
    EducationForm, 
    EduProgramm,
};
