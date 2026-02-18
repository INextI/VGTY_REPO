
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

//таблы для связи
const GroupDiscipline = require('./groupDisciplineModel');

//связи

// Связь "Один-к-Одному": User <-> Student
User.hasOne(Student, { foreignKey: 'user_id' })
Student.belongsTo(User, { foreignKey: 'user_id' })

// Связь "Один-к-Одному": User <-> Employee
User.hasOne(Employee, { foreignKey: 'user_id' })
Employee.belongsTo(User, { foreignKey: 'user_id' })

//Employee ↔ Role (Многие к одному)
Role.hasMany(Employee, { foreignKey: 'role_id' })
Employee.belongsTo(Role, { foreignKey: 'role_id' })

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
