const sequelize = require('../config/db')
const {DataTypes, UUIDV4} = require('sequelize')

const CourseGrade = sequelize.define('course_grade', {

    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },

    discipline_id: {
        type: DataTypes.UUID,
        allowNull: false
    },

    student_id: {
        type: DataTypes.UUID,
        allowNull: false
    },

    final_score: {
        type: DataTypes.INTEGER
    },

    graded_by: {
        type: DataTypes.UUID
    },

    graded_at: {
        type: DataTypes.DATE
    }

}, {
    tableName: 'course_grades',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['discipline_id', 'student_id']
        }
    ]
})

module.exports = CourseGrade