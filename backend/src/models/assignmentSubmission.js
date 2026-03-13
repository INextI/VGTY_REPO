const sequelize = require('../config/db')
const {DataTypes, UUIDV4} = require('sequelize')

const AssignmentSubmission = sequelize.define('assignment_submission', {

    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },

    assignment_id: {
        type: DataTypes.UUID,
        allowNull: false
    },

    student_id: {
        type: DataTypes.UUID,
        allowNull: false
    },

    file_url: {
        type: DataTypes.STRING,
        allowNull: false
    },

    comment: {
        type: DataTypes.TEXT
    },

    score: {
        type: DataTypes.INTEGER
    },

    graded_by: {
        type: DataTypes.UUID
    },

    graded_at: {
        type: DataTypes.DATE
    },

    submitted_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }

}, {
    tableName: 'assignment_submissions',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['assignment_id', 'student_id']
        }
    ]
})

module.exports = AssignmentSubmission