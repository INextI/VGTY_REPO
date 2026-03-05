const sequelize = require('../config/db')
const {DataTypes} = require('sequelize')

const FacultyModel = sequelize.define('faculty', {
    id: {type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4},
    name: {type: DataTypes.STRING, allowNull: false, unique: true}
}, {
    tableName: 'faculties',
    timestamps: false
})

module.exports = FacultyModel;