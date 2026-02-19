const Router = require('express');
const router = new Router

const userRouter = require('./userRoute')
const studentRouter = require('./studentRoute')
const employeeRouter = require('./employeeRoute')

router.use('/user', userRouter)
router.use('/student', studentRouter)
router.use('/employee', employeeRouter)

module.exports = router