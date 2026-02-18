
/*
async function createAdmin() {
    // 1. Определяем данные администратора
    const login = 'admin@yourapp.com'; // Используйте email или уникальный логин
    const password = 'admin123';       // Пароль, который будет захэширован

    try {
        // 2. Генерируем безопасный bcrypt хэш для пароля
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        console.log(`Пароль для входа: ${password}`);
        console.log(`Сгенерирован bcrypt хэш: ${hashedPassword}`);

        // 3. Используем вашу SQL-логику, но с параметрами для безопасности
        const query = `
            WITH new_user AS (
                INSERT INTO users (login, password_hash)
                VALUES ($1, $2)
                RETURNING id
            )
            INSERT INTO employees (user_id, last_name, first_name, role_id, position_id)
            VALUES (
                (SELECT id FROM new_user),
                'Администратор',
                'Главный',
                (SELECT id FROM employee_roles WHERE name = 'Администратор'),
                (SELECT id FROM positions WHERE name = 'Системный администратор')
            );
        `;
        
        // 4. Выполняем запрос, передавая логин и хэш как параметры
        await db.query(query, [login, hashedPassword]);
        
        console.log('Пользователь "Администратор" успешно создан в таблицах users и employees.');

    } catch (error) {
        // Обработка возможных ошибок (например, если такой login уже существует)
        if (error.code === '23505') { // Код ошибки для unique_violation в PostgreSQL
             console.error(`Ошибка: Пользователь с логином "${login}" уже существует.`);
        } else {
             console.error('Ошибка при создании администратора:', error.message);
        }
    } finally {
        // Завершаем процесс, чтобы скрипт не "завис"
        process.exit();
    }
}

// Запускаем функцию
createAdmin();

*/