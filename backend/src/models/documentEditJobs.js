const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const DocumentEditJob = sequelize.define('DocumentEditJob', {
    id: {type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4},
    search_text: { type: DataTypes.TEXT, allowNull: false },
    replace_text: { type: DataTypes.TEXT, allowNull: false },
    filter_criteria: { type: DataTypes.JSONB },
    status: { 
        type: DataTypes.STRING(20), 
        allowNull: false, 
        defaultValue: 'pending',
        validate: {
            isIn: [['pending', 'in_progress', 'completed', 'failed', 'cancelled']]
        }
    },
    created_by_employee_id: { type: DataTypes.UUID },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    completed_at: { type: DataTypes.DATE }
}, {
    tableName: 'document_edit_jobs',
    timestamps: false
})

module.exports = DocumentEditJob