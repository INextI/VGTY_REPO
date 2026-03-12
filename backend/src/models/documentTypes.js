const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const DocumentType = sequelize.define('DocumentType', {
    id: {type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4},
    name: { type: DataTypes.STRING, allowNull: false, unique: true }
}, {
    tableName: 'document_types',
    timestamps: false
})

module.exports = DocumentType

