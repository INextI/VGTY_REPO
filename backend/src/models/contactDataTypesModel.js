const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const ContactDataTypes = sequelize.define('ContactDataTypes', {
    id: {type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4},
    name: { type: DataTypes.STRING, allowNull: false, unique: true }
}, {
    tableName: 'contact_data_types',
    timestamps: false
})

module.exports = ContactDataTypes