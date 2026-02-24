const sequelize = require('../config/db')
const {DataTypes} = require('sequelize')

const Student = sequelize.define('student',{
   id: {type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4},
   user_id: {type: DataTypes.UUID, allowNull: false},
   first_name: {type: DataTypes.STRING, allowNull: false},
   last_name: {type: DataTypes.STRING, allowNull: false},
   patronymic: {type: DataTypes.STRING},
   birth_date: {type: DataTypes.DATEONLY},
   faculty_id: {type: DataTypes.UUID, allowNull: false},
   group_id: {type: DataTypes.UUID, allowNull: false},
   education_form_id: {type: DataTypes.UUID, allowNull: false}
},{
   tableName: 'students',
   timestamps: false
})

module.exports = Student