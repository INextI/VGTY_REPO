const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Импортируем наше соединение

const Department = sequelize.define('Department',
    {
        // Описание полей (атрибутов)
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,       // Это первичный ключ
            autoIncrement: true,    // Он автоинкрементируется (SERIAL)
        },
        name: {
            type: DataTypes.STRING, // VARCHAR -> STRING
            allowNull: false,       // NOT NULL -> allowNull: false
            unique: true,           // UNIQUE -> unique: true
        },
        description: {
            type: DataTypes.TEXT,   // TEXT -> TEXT
            allowNull: true,        // Если разрешены NULL значения, можно не указывать или поставить true
        },
    },
    {
        // Опции модели
        tableName: 'departments',   // Явно указываем имя таблицы в БД
        timestamps: false,          // Отключаем автоматическое создание полей createdAt и updatedAt
    }
);

module.exports = Department;
