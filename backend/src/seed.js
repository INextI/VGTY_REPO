const bcrypt = require("bcrypt")

const sequelize = require("./config/db")

const {
  User,
  Student,
  Employee,
  Group,
  Discipline,
  EducationForm,
  EduProgramm,
  Role,
  AcademicYear,
  Faculty
} = require("./models/index")

async function seed() {

  try {

    await sequelize.sync()

    console.log("DB synced")

    // ===== ROLES =====

    const adminRole = await Role.findOrCreate({
      where: { name: "admin" }
    })

    const studentRole = await Role.findOrCreate({
      where: { name: "student" }
    })

    const employeeRole = await Role.findOrCreate({
      where: { name: "employee" }
    })

    // ===== EDUCATION FORMS =====

    const [fullTime] = await EducationForm.findOrCreate({
      where: { name: "full-time" }
    })

    const [correspondence] = await EducationForm.findOrCreate({
      where: { name: "correspondence" }
    })

    // ===== ACADEMIC YEAR =====

    const [year] = await AcademicYear.findOrCreate({
      where: { course_year: 2024 }
    })

    // ===== FACULTY =====

    const [faculty] = await Faculty.findOrCreate({
      where: { name: "Faculty of Computer Science" }
    })

    // ===== EDU PROGRAM =====

    const [program] = await EduProgramm.findOrCreate({
      where: { name: "Software Engineering" },
      defaults: {
        faculty_id: faculty.id,
        education_form_id: fullTime.id
      }
    })

    // ===== PASSWORD =====

    const passwordHash = await bcrypt.hash("123456", 10)

    // ===== USERS =====

    const [adminUser] = await User.findOrCreate({
      where: { login: "admin" },
      defaults: {
        password_hash: passwordHash,
        role_id: adminRole[0].id
      }
    })

    const [teacherUser] = await User.findOrCreate({
      where: { login: "teacher" },
      defaults: {
        password_hash: passwordHash,
        role_id: employeeRole[0].id
      }
    })

    const [studentUser] = await User.findOrCreate({
      where: { login: "student" },
      defaults: {
        password_hash: passwordHash,
        role_id: studentRole[0].id
      }
    })

    // ===== EMPLOYEE =====

    const [teacher] = await Employee.findOrCreate({
      where: { user_id: teacherUser.id },
      defaults: {
        first_name: "Ivan",
        last_name: "Petrov",
        patronymic: "Sergeevich",
        faculty_id: faculty.id
      }
    })

    // ===== GROUP =====

    const [group] = await Group.findOrCreate({
      where: { name: "SE-101" },
      defaults: {
        edu_program_id: program.id,
        curator_id: teacher.id,
        academic_year_id: year.id
      }
    })

    // ===== STUDENT =====

    const [student] = await Student.findOrCreate({
      where: { user_id: studentUser.id },
      defaults: {
        first_name: "Alexey",
        last_name: "Ivanov",
        patronymic: "Igorevich",
        birth_date: "2003-04-12",
        faculty_id: faculty.id,
        group_id: group.id,
        education_form_id: fullTime.id
      }
    })

    // ===== DISCIPLINES =====

    const node = await Discipline.create({
      name: "Node.js",
      owner_employee_id: teacher.id,
      image_url: "/static/img/discipline/default.png",
      description: "Backend development with Node.js",
      education_form_id: fullTime.id
    })

    const db = await Discipline.create({
      name: "Databases",
      owner_employee_id: teacher.id,
      image_url: "/static/img/discipline/default.png",
      description: "SQL and database design",
      education_form_id: fullTime.id
    })

    const algorithms = await Discipline.create({
      name: "Algorithms",
      owner_employee_id: teacher.id,
      image_url: "/static/img/discipline/default.png",
      description: "Algorithms and data structures",
      education_form_id: fullTime.id
    })

    // ===== GROUP ↔ DISCIPLINE =====

    await group.addDisciplines([
      node,
      db,
      algorithms
    ])

    console.log("SEED COMPLETED")

  } catch (e) {

    console.error(e)

  } finally {

    await sequelize.close()

  }

}

seed()