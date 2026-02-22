const Router = require('express');
const router = new Router()

const authMiddleware = require('../middleware/authMiddleware')

const userRouter = require('./userRoute')
const studentRouter = require('./studentRoute')
const employeeRouter = require('./employeeRoute')
const authRouter = require('./authRoute')
const roleRouter = require('./roleRoute')

router.use('/user', userRouter)
router.use('/student', authMiddleware, studentRouter)
router.use('/employee', authMiddleware, employeeRouter)
router.use('/auth', authRouter)
router.use('/role', roleRouter)

module.exports = router