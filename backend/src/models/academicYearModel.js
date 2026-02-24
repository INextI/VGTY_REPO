const sequelize = require('../config/db')
const {DataTypes, UUIDV4} = require('sequelize')

const AcademicYear = sequelize.define('academic_year', {
    id: {type: DataTypes.UUID, primaryKey:true, defaultValue:UUIDV4},
    course_year: {type: DataTypes.INTEGER}
}, {
    tableName: 'academic_years',
    timestamps: false
})

module.exports = AcademicYear