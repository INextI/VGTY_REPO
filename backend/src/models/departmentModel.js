const sequelize = require('../config/db')
const {DataTypes} = require('sequelize')

const Department = sequelize.define('Department',
    {
        // Описание полей (атрибутов)
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4 
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
        },
    },
    {
        tableName: 'departments',
        timestamps: false,          
    }
);

module.exports = Department;
