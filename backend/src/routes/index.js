const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware')
const checkRole = require('../middleware/checkRoles');

const userRouter = require('./userRoute')
const studentRouter = require('./studentRoute')
const employeeRouter = require('./employeeRoute')
const authRouter = require('./authRoute')
const roleRouter = require('./roleRoute')
const disciplineRouter = require('./disciplineRoute')
const academicYearRouter = require('./academicYearRoute')
const educationFormRouter = require('./educationFormRoute')
const eduProgrammRouter = require('./eduProgrammRoute')
const facultyRouter = require('./facultyRoute')
const groupRouter = require('./groupRoute')

router.use('/user', userRouter)
router.use('/student', authMiddleware, studentRouter)
router.use('/employee', authMiddleware, employeeRouter)
router.use('/auth', authRouter)
router.use('/role', roleRouter)
router.use('/discipline', disciplineRouter)
router.use('/academicYear', academicYearRouter)
router.use('/educationForm', educationFormRouter)
router.use('/eduProgramm', eduProgrammRouter)
router.use('/faculty', facultyRouter)
router.use('/group', groupRouter)



// Только для админов
router.use('/admin-only', authMiddleware, checkRole('admin'), userRouter);
// router.beforeEach((to, from, next) => {
//     const user = JSON.parse(localStorage.getItem('user'));
    
//     if (to.meta.role && user?.role !== to.meta.role) {
//         return next('/login'); // Если роль не совпадает, отправляем на вход
//     }
//     next();
// });


module.exports = router