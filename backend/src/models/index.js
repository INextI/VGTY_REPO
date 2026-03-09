
const sequelize = require('../config/db')

//таблы
const User = require('./userModel');
const Student = require('./studentModel');
const Employee = require('./employeeModel');
const Group = require('./groupModel');
const Discipline = require('./disciplineModel');
const EducationForm = require('./educationFormModel')
const EduProgramm = require('./eduProgrammModel')
const Token = require('./tokenModel');
const Role = require('./roleModel')
const AcademicYear = require('./academicYearModel')
const Department = require('./departmentsModel')
const Faculty = require('./facultyModel')
const ContactDataTypes = require('./contactDataTypesModel')
const DocumentType = require('./documentTypes')
const DocumentEditJob = require('./documentEditJobs')
const DocumentEditJobLog = require('./documentEditJobLogs')
const DocumentAttachment = require('./documentAttachments')
//таблы для связи
const GroupDiscipline = require('./groupDisciplineModel');
const DisciplineEmployee = require('./disciplineEmployeeModel')

const Session = require('./sessionsModel')
const CompletedSession = require('./completedSessionsModel')
const ContactData = require('./contactDataModel')

const EmployeeGrades = require('./employeeGradesModel')
const Positions = require('./positionsModel')


//связи

// Связь "Один-к-Одному": User <-> Student
User.hasOne(Student, { foreignKey: 'user_id', onDelete: 'CASCADE' })
Student.belongsTo(User, { foreignKey: 'user_id' })

// Связь "Один-к-Одному": User <-> Employee
User.hasOne(Employee, { foreignKey: 'user_id', onDelete: 'CASCADE' })
Employee.belongsTo(User, { foreignKey: 'user_id' })

//User ↔ Role (Многие к одному)
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'role_id' });


// Связь "Один-ко-Многим": Faculty -> Employees
Faculty.hasMany(Employee, { foreignKey: 'faculty_id' })
Employee.belongsTo(Faculty, { foreignKey: 'faculty_id' })

// Связь "Один-ко-Многим": Group -> Students
Group.hasMany(Student, { foreignKey: 'group_id', as: 'students' })
Student.belongsTo(Group, { foreignKey: 'group_id', as: 'group' })

//Student ↔ EducationForm (Многие к одному)
EducationForm.hasMany(Student, { foreignKey: 'education_form_id' })
Student.belongsTo(EducationForm, { foreignKey: 'education_form_id' })

//Group ↔ EduProgram (Многие к одному)
EduProgramm.hasMany(Group, { foreignKey: 'edu_program_id', onDelete: 'CASCADE', as: 'groups' })
Group.belongsTo(EduProgramm, { foreignKey: 'edu_program_id', as: 'eduProgramm' })

// Связь "Один-к-Одному": Group ↔ AcademicYear
AcademicYear.hasMany(Group, { foreignKey: 'academic_year_id', onDelete: 'CASCADE' })
Group.belongsTo(AcademicYear, { foreignKey: 'academic_year_id'})

// Связь "Один-к-Одному": Group ↔ Employee
Employee.hasMany(Group, { foreignKey: 'curator_id', as: 'curatedGroups' })
Group.belongsTo(Employee, { foreignKey: 'curator_id', as: 'curator' })

// Связь "Один-к-Одному": EduProgram ↔ Faculty
Faculty.hasMany(EduProgramm, { foreignKey: 'faculty_id' })
EduProgramm.belongsTo(Faculty, { foreignKey: 'faculty_id' })


// Связь "Один-к-Многим": EduProgram ↔ EducationForm
EducationForm.hasMany(EduProgramm, { foreignKey: 'education_form_id' })
EduProgramm.belongsTo(EducationForm, { foreignKey: 'education_form_id' })

/*
// Связь "Один-к-Одному": Discipline ↔ EducationForm
EducationForm.hasMany(Discipline, { foreignKey: 'education_form_id' })
Discipline.belongsTo(EducationForm, { foreignKey: 'education_form_id' })
*/

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

// Связи для DocumentEditJob
DocumentEditJob.belongsTo(Employee, {
    foreignKey: 'created_by_employee_id',
    as: 'createdBy'
})

Employee.hasMany(DocumentEditJob, {
    foreignKey: 'created_by_employee_id',
    as: 'documentEditJobs'
})

// Связи для DocumentEditJobLog
DocumentEditJobLog.belongsTo(DocumentEditJob, {
    foreignKey: 'job_id',
    as: 'job'
})

DocumentEditJob.hasMany(DocumentEditJobLog, {
    foreignKey: 'job_id',
    as: 'logs'
})

DocumentEditJobLog.belongsTo(DocumentAttachment, {
    foreignKey: 'document_attachment_id',
    as: 'document'
})

DocumentAttachment.hasMany(DocumentEditJobLog, {
    foreignKey: 'document_attachment_id',
    as: 'editLogs'
})

// Связи для DocumentAttachment
DocumentAttachment.belongsTo(DocumentType, {
    foreignKey: 'type_id',
    as: 'documentType'
})

DocumentType.hasMany(DocumentAttachment, {
    foreignKey: 'type_id',
    as: 'attachments'
})

DocumentAttachment.belongsTo(Department, {
    foreignKey: 'department_id',
    as: 'department'
})

Department.hasMany(DocumentAttachment, {
    foreignKey: 'department_id',
    as: 'attachments'
})

DocumentAttachment.belongsTo(Discipline, {
    foreignKey: 'discipline_id',
    as: 'discipline'
})

Discipline.hasMany(DocumentAttachment, {
    foreignKey: 'discipline_id',
    as: 'attachments'
})

DocumentAttachment.belongsTo(EduProgramm, {
    foreignKey: 'edu_program_id',
    as: 'eduProgram'
})

EduProgramm.hasMany(DocumentAttachment, {
    foreignKey: 'edu_program_id',
    as: 'attachments'
})

DocumentAttachment.belongsTo(Session, {
    foreignKey: 'session_id',
    as: 'session'
})

Session.hasMany(DocumentAttachment, {
    foreignKey: 'session_id',
    as: 'attachments'
})


/**
 * Определение связей для модели Session
 */
Session.associate = (models) => {
    Session.belongsTo(models.Discipline, {
        foreignKey: 'discipline_id',
        as: 'discipline'
    });
    
    Session.belongsTo(models.Employee, {
        foreignKey: 'teacher_id',
        as: 'teacher'
    });
    
    Session.hasMany(models.CompletedSession, {
        foreignKey: 'session_id',
        as: 'completedSessions'
    });
    
    Session.belongsToMany(models.Student, {
        through: models.CompletedSession,
        foreignKey: 'session_id',
        otherKey: 'student_id',
        as: 'students'
    });
};

/**
 * Определение связей для модели CompletedSession
 */
CompletedSession.associate = (models) => {
    CompletedSession.belongsTo(models.Student, {
        foreignKey: 'student_id',
        as: 'student'
    });
    
    CompletedSession.belongsTo(models.Session, {
        foreignKey: 'session_id',
        as: 'session'
    });
};

/**
 * Определение связей для модели ContactData
 */
ContactData.associate = (models) => {
    ContactData.belongsTo(models.ContactDataTypes, {
        foreignKey: 'type_id',
        as: 'contactType'
    });
    
    // Полиморфные связи
    ContactData.belongsTo(models.Student, {
        foreignKey: 'person_id',
        constraints: false,
        scope: {
            person_type: 'student'
        },
        as: 'studentContact'
    });
    
    ContactData.belongsTo(models.Employee, {
        foreignKey: 'person_id',
        constraints: false,
        scope: {
            person_type: 'employee'
        },
        as: 'employeeContact'
    });
};

module.exports = {
    User,
    Student,
    Employee,
    
    Group,
    Discipline, 
    EducationForm, 
    EduProgramm,

   DocumentType,
    DocumentEditJob,
    DocumentEditJobLog,
    DocumentAttachment,
    Department,
    ContactDataTypes,
    Session,
    CompletedSession,
    ContactData,
    EmployeeGrades , 
    Positions
};
