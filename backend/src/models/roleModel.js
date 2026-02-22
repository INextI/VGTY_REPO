const sequelize = require('../config/db')
const {DataTypes} = require('sequelize')

const Role = sequelize.define('role',{
    id: {type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4},
    name: {type: DataTypes.ENUM('student', 'employee', 'admin'), allowNull: false}
})

module.exports = Role