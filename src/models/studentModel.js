const { DataTypes } = require('sequelize');
        const sequelize = require('../config/db');

        const Student = sequelize.define('Student', {
           // ... поля last_name, first_name, patronymic, birth_date
        }, { tableName: 'students', timestamps: false });

        module.exports = Student;
        