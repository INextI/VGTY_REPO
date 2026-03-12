const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const Positions = sequelize.define('Positions', {
    id: {type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4},
    name: { type: DataTypes.STRING, allowNull: false, unique: true }
}, {
    tableName: 'positions',
    timestamps: false
})

module.exports = Positions