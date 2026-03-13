const sequelize = require('../config/db')
const {DataTypes, UUIDV4} = require('sequelize')

const Assignment = sequelize.define('assignment', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },

    discipline_id: {
        type: DataTypes.UUID,
        allowNull: false
    },

    author_employee_id: {
        type: DataTypes.UUID,
        allowNull: false
    },

    title: {
        type: DataTypes.STRING,
        allowNull: false
    },

    description: {
        type: DataTypes.TEXT
    },

    deadline: {
        type: DataTypes.DATE
    },

    max_score: {
        type: DataTypes.INTEGER,
        defaultValue: 100
    }

}, {
    tableName: 'assignments',
    timestamps: true,
    updatedAt: false
})

module.exports = Assignment