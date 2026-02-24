const sequelize = require('../config/db')
const {DataTypes} = require('sequelize')


const EduProgramm = sequelize.define('edu_programm', {
    id: {type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4},
    name: {type: DataTypes.STRING, allowNull: false},
    faculty_id: {type: DataTypes.UUID, allowNull: false},
    education_form_id: {type: DataTypes.UUID}
},{
    tableName: 'edu_programs',
    timestamps: false
})

module.exports = EduProgramm;