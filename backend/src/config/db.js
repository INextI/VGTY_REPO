// Отладочный вывод
console.log('=== DB CONFIG ===');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD, 'type:', typeof process.env.DB_PASSWORD);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('=================');

// Проверяем, что пароль строка
const password = process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : '';
const { Sequelize } = require('sequelize');
require('dotenv').config();

module.exports = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    password,
    {
        dialect: 'postgres',
        host: process.env.DB_HOST,
        port: process.env.DB_PORT
    }
)


// const { Sequelize } = require('sequelize');

// module.exports = new Sequelize(
//     process.env.DB_NAME,
//     process.env.DB_USER,
//     process.env.DB_PASSWORD,
//     {
//         dialect: 'postgres',
//         host: process.env.DB_HOST,
//         port: process.env.DB_PORT
//     }
// )