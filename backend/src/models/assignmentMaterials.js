const sequelize = require('../config/db')
const {DataTypes, UUIDV4} = require('sequelize')

const AssignmentMaterials = sequelize.define('assignmentMaterials', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },

    assignment_id: {
        type: DataTypes.UUID,
        allowNull: false
    },

    title: {
        type: DataTypes.STRING,
        allowNull: false
    },

    url: {type: DataTypes.STRING}

}, {
    tableName: 'assignments_materials',
    timestamps: true,
    updatedAt: false
})

module.exports = AssignmentMaterials