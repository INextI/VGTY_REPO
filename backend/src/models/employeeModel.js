const sequelize = require('../config/db')
const {DataTypes} = require('sequelize')

const Employee = sequelize.define('Employee', {
    id: {type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4},
    user_id: {type: DataTypes.UUID, allowNull: false, unique: true},
    first_name: {type: DataTypes.STRING, allowNull: false},
    last_name: {type: DataTypes.STRING, allowNull: false},
    patronymic: {type: DataTypes.STRING},
    birth_date: {type: DataTypes.DATEONLY},
    faculty_id: {type: DataTypes.UUID}
}, { 
    tableName: 'employees', 
    timestamps: false 
})

module.exports = Employee;
        