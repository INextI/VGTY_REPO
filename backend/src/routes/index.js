const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware')

const userRouter = require('./userRoute')
const studentRouter = require('./studentRoute')
const employeeRouter = require('./employeeRoute')
const authRouter = require('./authRoute')
const roleRouter = require('./roleRoute')
const disciplineRouter = require('./disciplineRoute')

router.use('/user', userRouter)
router.use('/student', authMiddleware, studentRouter)
router.use('/employee', authMiddleware, employeeRouter)
router.use('/auth', authRouter)
router.use('/role', roleRouter)
router.use('/discipline', disciplineRouter)

module.exports = router