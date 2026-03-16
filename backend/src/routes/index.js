const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware')
const checkRole = require('../middleware/checkRoles');

const { upload } = require('../middleware/formDataLogger.js');


const documentAttachmentController = require('../controllers/documentAttachmentController');


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
const assignmentRouter = require('./assignmentRoute')
const assignmentMaterialsRoute = require('./assignmentMaterialsRoute')
const assignmentFilesRoute = require('./assignmentFilesRoute')
const healthRoute = require('./healthRroute.js')


const sessionRoutes = require('./sessionRoutes');
const positionsRoutes = require('./positionsRoutes');
const employeeGradesRoutes = require('./employeeGradesRoute');
const contactDataTypesRoutes = require('./contactDataTypesRoutes');
const contactDataRoutes = require('./contactDataRoutes');
const departmentRoutes = require('./departmentRoutes');
const disciplineEmployeeRoutes = require('./disciplineEmployeeRoutes');
const documentAttachmentRoutes = require('./documentAttachmentRoutes');
const documentEditJobLogRoutes = require('./documentEditJobLogRoutes');
const documentEditJobRoutes = require('./documentEditJobRoutes');
const documentTypeRoutes = require('./documentTypeRoutes');
const documentJobsRoutes = require('./documentJobs');


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
router.use('/assignment', assignmentRouter)
router.use('/assignmentMaterials', assignmentMaterialsRoute)
router.use('/assignmentFiles', assignmentFilesRoute)

router.use('/session', sessionRoutes)
router.use('/positions', positionsRoutes)
router.use('/employeeGrade', employeeGradesRoutes)
router.use('/contactDataTypes', contactDataTypesRoutes)
router.use('/contactData', contactDataRoutes)
router.use('/department', departmentRoutes)
router.use('/disciplineEmployee', disciplineEmployeeRoutes)
//router.use('/documentAttachment', documentAttachmentRoutes)
router.use('/documentEditJobLog', documentEditJobLogRoutes)
router.use('/documentEditJob', documentEditJobRoutes)
router.use('/documentType', documentTypeRoutes)
router.use('/document-jobs', documentJobsRoutes)
router.use('/health', healthRoute)

router.post('/documentAttachment', upload.single('doc'), documentAttachmentController.create);
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