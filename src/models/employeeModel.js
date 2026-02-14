const { DataTypes } = require('sequelize');
        const sequelize = require('../config/db');

        const Employee = sequelize.define('Employee', {
            // ... поля last_name, first_name, patronymic, birth_date
        }, { tableName: 'employees', timestamps: false });

        module.exports = Employee;
        