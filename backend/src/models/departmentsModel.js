const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const Department = sequelize.define('Department', {
    id: {type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4},
    name: { type: DataTypes.STRING, allowNull: false, unique: true }
}, {
    tableName: 'departments',
    timestamps: false
})

module.exports = Department