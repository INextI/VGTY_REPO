const sequelize = require('../config/db')
const {DataTypes} = require('sequelize')

const Role = sequelize.define('role',{
    id: {type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4},
    name: {type: DataTypes.STRING, allowNull: false, defaultValue: ''}, 
    code: { type: DataTypes.STRING, allowNull: true, unique: true }
}, {
    tableName: 'roles',
    timestamps: false
})

module.exports = Role