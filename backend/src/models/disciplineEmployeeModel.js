const sequelize = require('../config/db')
const {DataTypes} = require('sequelize')

const DisciplineEmployee = sequelize.define('DisciplineEmployee', {
    id: {type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4},
    discipline_id: {type: DataTypes.UUID, allowNull: false},
    employee_id: {type: DataTypes.UUID, allowNull: false}
}, {
    tableName: 'discipline_employees',
    timestamps: false
})

module.exports = DisciplineEmployee