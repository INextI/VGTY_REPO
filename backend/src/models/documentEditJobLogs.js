const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const DocumentEditJobLog = sequelize.define('DocumentEditJobLog', {
    id: {type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4},
    job_id: { type: DataTypes.UUID, allowNull: false },
    document_attachment_id: { type: DataTypes.UUID, allowNull: false },
    status: { 
        type: DataTypes.STRING(20), 
        allowNull: false,
        validate: {
            isIn: [['success', 'failed', 'skipped']]
        }
    },
    message: { type: DataTypes.TEXT },
    original_document_id_backup: { type: DataTypes.UUID }
}, {
    tableName: 'document_edit_job_logs',
    timestamps: false
})

module.exports = DocumentEditJobLog