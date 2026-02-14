




const express = require('express');
    const cors = require('cors');
    const path = require('path');

    // Импорт роутов
    const authRoutes = require('./routes/authRoutes');
    const userRoutes = require('./routes/userRoutes');
    const courseRoutes = require('./routes/courseRoutes');
    const adminRoutes = require('./routes/adminRoutes');

    const app = express();

    // Middleware
    app.use(cors()); // Разрешаем запросы с других доменов
    app.use(express.json()); // Для парсинга JSON-тел запросов
    app.use(express.urlencoded({ extended: true })); // Для парсинга форм

   // 1. Раздаем HTML-файлы из их папки как корень сайта
app.use(express.static(path.join(__dirname, '../public/styles/html')));

// 2. Раздаем CSS-файлы по виртуальному пути /css
app.use('/css', express.static(path.join(__dirname, '../public/styles/css')));

// 3. Раздаем JS-файлы по виртуальному пути /js
app.use('/js', express.static(path.join(__dirname, '../public/js')));

    // API роуты
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/courses', courseRoutes);
    app.use('/api/admin', adminRoutes); 

    module.exports = app;
    