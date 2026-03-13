const sequelize = require('../config/db')
const {DataTypes, UUIDV4} = require('sequelize')

const AssignmentFiles = sequelize.define('assignmentFiles', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },

    assignment_id: {
        type: DataTypes.UUID,
        allowNull: false
    },

    file_url: {
        type: DataTypes.STRING,
        allowNull: false
    },

    original_name: {type: DataTypes.STRING}

}, {
    tableName: 'assignments_files',
    timestamps: true,
    updatedAt: false
})

module.exports = AssignmentFiles