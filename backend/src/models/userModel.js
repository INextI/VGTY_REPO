const sequelize = require('../config/db')
const {DataTypes} = require('sequelize')


const User = sequelize.define('user', {
    id: {type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4},
    login: {type: DataTypes.STRING, allowNull: false, unique: true},
    password_hash: {type: DataTypes.TEXT, allowNull: false},
    is_active: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true},
    last_login: {type: DataTypes.DATE}
},{
    tableName: 'users',
    timestamps: true,
    updatedAt: false
})

module.exports = User














/*





const db = require('../config/db');
//const bcrypt = require('bcryptjs');
const bcrypt = require('bcrypt');

const findUserByLogin = async (login) => {
    const { rows } = await db.query('SELECT * FROM users WHERE login = $1', [login]);
    return rows[0] || null;
};

const findUserWithRoleById = async (id) => {
    const query = `
        SELECT
            u.id,
            u.login,
            u.password_hash,
            CONCAT_WS(' ', e.last_name, e.first_name) AS full_name,
            er.name AS role
        FROM users u
        JOIN employees e ON u.id = e.user_id
        LEFT JOIN employee_roles er ON e.role_id = er.id
        WHERE u.id = $1

        UNION ALL

        SELECT
            u.id,
            u.login,
            u.password_hash,
            CONCAT_WS(' ', s.last_name, s.first_name) AS full_name,
            'student' AS role
        FROM users u
        JOIN students s ON u.id = s.user_id
        WHERE u.id = $1;
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
};


const findUserByEmail = async (email) => {
    // Предполагаем, что email хранится в поле login
    const { rows } = await db.query('SELECT * FROM users WHERE login = $1', [email]);
    return rows[0] || null;
};

const createUser = async (dbClient, userData) => {
    const {
        login, password, firstName, lastName, patronymic,
        role, educationFormId, groupId, positionId, departmentId
    } = userData;

    try {
        await dbClient.query('BEGIN');

        // 1. Создаем пользователя в таблице users
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const userInsertQuery = `INSERT INTO users (login, password_hash) VALUES ($1, $2) RETURNING id;`;
        const userResult = await dbClient.query(userInsertQuery, [login, hashedPassword]);
        const userId = userResult.rows[0].id;

       if (role === 'student') {
            // 2. Создаем студента (используем null, если поля не заполнены)
            const studentInsertQuery = `
                INSERT INTO students (user_id, first_name, last_name, patronymic, group_id, education_form_id)
                VALUES ($1, $2, $3, $4, $5, $6);`;
            await dbClient.query(studentInsertQuery, [
                userId, firstName, lastName, patronymic || null, 
                groupId ? parseInt(groupId) : null, 
                educationFormId ? parseInt(educationFormId) : null
               
            ]);
        } else {
            // 2. Создаем сотрудника
            const roleRes = await dbClient.query('SELECT id FROM employee_roles WHERE name = $1', [role]);
            if (roleRes.rows.length === 0) throw new Error(`Роль "${role}" не найдена в базе (таблица employee_roles)`);
            const roleId = roleRes.rows[0].id;
            
            const employeeInsertQuery = `
                INSERT INTO employees (user_id, first_name, last_name, patronymic, role_id, position_id, department_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7);`;
            await dbClient.query(employeeInsertQuery, [
                userId, firstName, lastName, patronymic || null, 
                roleId, positionId || null, departmentId || null
            ]);
        }

        await dbClient.query('COMMIT');
        return { id: userId, login, role };
    } catch (error) {
        await dbClient.query('ROLLBACK');
        throw error;
    }
};

// Добавьте это, если используется в контроллере для проверки
/*const findUserByLogin = async (login) => {
    const pool = require('../config/db');
    const res = await pool.query('SELECT * FROM users WHERE login = $1', [login]);
    return res.rows[0];
};*/

/*const createUser = async (dbClient, userData) => {
    const {// Деструктурируем все возможные поля из userData
        login, password, firstName, lastName, patronymic,
        role, educationFormId, groupId, positionId, departmentId
    } = userData;

    try {// 1. Начинаем транзакцию
        await dbClient.query('BEGIN');
 // 2. Хешируем пароль и создаем запись в таблице `users`
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
  //Добавлены значения в массив
        const userInsertQuery = `INSERT INTO users (login, password_hash) VALUES ($1, $2) RETURNING id;`;
        const userResult = await dbClient.query(userInsertQuery, [login, hashedPassword]);
        const userId = userResult.rows[0]?.id;

        if (!userId) throw new Error('Ошибка создания в таблице users');

        if (role === 'student') {// 3. Создаем запись в соответствующей таблице профиля в зависимости от роли
            const studentInsertQuery = `
                INSERT INTO students (user_id, first_name, last_name, patronymic, group_id, education_form_id)
                VALUES ($1, $2, $3, $4, $5, $6);`;
            await dbClient.query(studentInsertQuery, [userId, firstName, lastName, patronymic || null, groupId || null, educationFormId]);
        } else {
            const roleRes = await dbClient.query('SELECT id FROM employee_roles WHERE name = $1', [role]);
            const roleId = roleRes.rows[0]?.id;
            
            const employeeInsertQuery = `
                INSERT INTO employees (user_id, first_name, last_name, patronymic, role_id, position_id, department_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7);`;
            await dbClient.query(employeeInsertQuery, [userId, firstName, lastName, patronymic || null, roleId, positionId || null, departmentId || null]);
        }
// 4. Если все успешно, подтверждаем транзакцию
        await dbClient.query('COMMIT');
        return { id: userId, login, role };
    } catch (error) {
        await dbClient.query('ROLLBACK');
        throw error;
    }
};*/


/*
const getAllUsers = async () => {
    const query = `
        SELECT
            u.id,
            u.login,
            e.first_name,
            e.last_name,
            er.name AS role
        FROM users u
        JOIN employees e ON u.id = e.user_id
        LEFT JOIN employee_roles er ON e.role_id = er.id

        UNION ALL

        SELECT
            u.id,
            u.login,
            s.first_name,
            s.last_name,
            'student' AS role
        FROM users u
        JOIN students s ON u.id = s.user_id
        ORDER BY id ASC;
    `;
    const { rows } = await db.query(query);
    return rows;
};

const findUserById = async (id) => {
    // Эта функция будет аналогична findUserWithRoleById для получения полной информации
    return await findUserWithRoleById(id);
};

const updateUserById = async (dbClient, userId, userData) => {
    // Данные для таблицы `users`
    const userFields = ['login', 'password', 'is_active'];
    // Данные для таблиц профилей (`employees`, `students`)
    const profileFields = [
        'first_name', 'last_name', 'patronymic', 'birth_date', 
        'role_id', 'position_id', 'department_id', 'grade_id', // для employees
        'group_id', 'education_form_id' // для students
    ];

    const userUpdates = {};
    const profileUpdates = {};

    // 1. Разделяем входящие данные по таблицам
    for (const key in userData) {
        if (Object.prototype.hasOwnProperty.call(userData, key)) {
            if (userFields.includes(key)) {
                userUpdates[key] = userData[key];
            } else if (profileFields.includes(key) && userData[key] !== undefined) {
                // Добавляем только определенные значения, чтобы не затереть поля null'ом
                profileUpdates[key] = userData[key];
            }
        }
    }
    
    // Хешируем пароль, если он был передан
    if (userUpdates.password) {
        const salt = await bcrypt.genSalt(10);
        userUpdates.password_hash = await bcrypt.hash(userUpdates.password, salt);
        delete userUpdates.password; // Удаляем исходный пароль
    }

    // Начинаем транзакцию
    await dbClient.query('BEGIN');

    try {
        let profileTable = null; // Определим таблицу профиля заранее

        // 2. Обновляем таблицу `users`, если есть что обновлять
        if (Object.keys(userUpdates).length > 0) {
            const userSetClauses = Object.keys(userUpdates)
                .map((key, index) => `"${key}" = $${index + 1}`)
                .join(', ');
            const userValues = Object.values(userUpdates);
            
            const updateUserQuery = `
                UPDATE users 
                SET ${userSetClauses} 
                WHERE id = $${userValues.length + 1}
            `;
            await dbClient.query(updateUserQuery, [...userValues, userId]);
        }

        // 3. Обновляем таблицу профиля (`employees` или `students`)
        if (Object.keys(profileUpdates).length > 0) {
            // Определяем, кто этот пользователь: сотрудник или студент
            const employeeCheck = await dbClient.query('SELECT 1 FROM employees WHERE user_id = $1', [userId]);
            if (employeeCheck.rows.length > 0) {
                profileTable = 'employees';
            } else {
                const studentCheck = await dbClient.query('SELECT 1 FROM students WHERE user_id = $1', [userId]);
                if (studentCheck.rows.length > 0) {
                    profileTable = 'students';
                }
            }
            
            if (!profileTable) {
                // Если профиль не найден, это аномалия, откатываем транзакцию
                throw new Error(`Профиль для пользователя с ID ${userId} не найден.`);
            }

            const profileSetClauses = Object.keys(profileUpdates)
                .map((key, index) => `"${key}" = $${index + 1}`)
                .join(', ');
            const profileValues = Object.values(profileUpdates);

            const updateProfileQuery = `
                UPDATE ${profileTable}
                SET ${profileSetClauses}
                WHERE user_id = $${profileValues.length + 1}
            `;
            await dbClient.query(updateProfileQuery, [...profileValues, userId]);
        }

        // 4. Фиксируем транзакцию
        await dbClient.query('COMMIT');
        
        // 5. Возвращаем обновленные данные (лучшая практика)
        // Если profileTable не был определен (т.к. обновлялись только данные из users), определим его сейчас
        if (!profileTable) {
            const employeeCheck = await dbClient.query('SELECT 1 FROM employees WHERE user_id = $1', [userId]);
            profileTable = employeeCheck.rows.length > 0 ? 'employees': 'students';
        }

        const finalQuery = `
            SELECT
                u.id,
                u.login,
                u.is_active,
                p.first_name,
                p.last_name,
                p.patronymic,
                p.birth_date,
                p.role_id,
                CASE
                    WHEN '${profileTable}' = 'employees' THEN p.position_id
                    ELSE NULL
                END AS position_id,
                CASE
                    WHEN '${profileTable}' = 'employees' THEN p.department_id
                    ELSE NULL
                END AS department_id,
                CASE
                    WHEN '${profileTable}' = 'students' THEN p.group_id
                    ELSE NULL
                END AS group_id
                -- Добавьте другие поля по аналогии
            FROM users u
            JOIN ${profileTable} p ON u.id = p.user_id
            WHERE u.id = $1;
        `;

        const { rows } = await dbClient.query(finalQuery, [userId]);
        
        if (rows.length === 0) {
            // Это маловероятно, если транзакция прошла успешно, но является хорошей проверкой
            throw new Error('Не удалось получить обновленные данные пользователя после коммита.');
        }

        return rows[0];

    } catch (error) {
        // 6. В случае ошибки откатываем транзакцию
        await dbClient.query('ROLLBACK');
        console.error(`Ошибка в транзакции при обновлении пользователя ${userId}:`, error);
        // Пробрасываем ошибку дальше, чтобы ее можно было обработать на более высоком уровне
        throw error;
    }
};

/**
 * Пример использования функции (в контексте вашего API-контроллера)
 */
/*
const updateUserHandler = async (req, res) => {
    const { id } = req.params;
    const userData = req.body;
    
    // Получаем одного клиента из пула для всей транзакции
    const client = await pool.connect();

    try {
        const updatedUser = await updateUserById(client, id, userData);
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при обновлении пользователя', error: error.message });
    } finally {
        // Обязательно возвращаем клиента в пул
        client.release();
    }
};*/


/*
const deleteUserById = async (id) => {
    // Реальная реализация потребует транзакции для удаления из связанных таблиц
    const { rows } = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return rows[0];
};

module.exports = {
    findUserByLogin,
    findUserWithRoleById,
    findUserByEmail,
    createUser,
    getAllUsers,
    findUserById,
    updateUserById,
    deleteUserById
};



/*


const db = require('../config/db');
const bcrypt = require('bcryptjs');

const findUserByLogin = async (login) => {
   const { rows } = await db.query('SELECT * FROM users WHERE login = $1', [login]); 
   return rows[0] || null;
};

const findUserWithRoleById = async (id) => {
    const query = `
    SELECT
            u.id,
            u.login,
            CONCAT_WS(' ', e.last_name, e.first_name) AS full_name,
            
            CASE 
                WHEN er.name = 'admin' THEN 'admin'
                ELSE 'teacher'
            END AS role
        FROM users u
        JOIN employees e ON u.id = e.user_id
        LEFT JOIN employee_roles er ON e.role_id = er.id
        WHERE u.id = $1

        UNION ALL

        SELECT
            u.id,
            u.login,
            CONCAT_WS(' ', s.last_name, s.first_name) AS full_name,
            'student' AS role
        FROM users u
        JOIN students s ON u.id = s.user_id
        WHERE u.id = $1;

        --SELECT u.id, u.login, u.login as full_name, 'admin' as role
        --FROM users u
        --WHERE u.id = $1 AND u.role = 'admin'
        --UNION ALL  
        --SELECT u.id, u.login, s.full_name, 'student' as role
        --FROM users u
        --JOIN students s ON u.id = s.user_id
        --WHERE u.id = $1
        --UNION ALL
        --SELECT u.id, u.login, e.full_name, 'teacher' as role
        --FROM users u
        --JOIN employees e ON u.id = e.user_id
        --WHERE u.id = $1;
    `;
   
  const { rows } = await db.query(query, [id, id]); 
    return rows[0] || null;
};

const findUserByEmail = async (email) => {
   const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
   return rows[0] || null;
};

const createUser = async (userData) => {
   const { firstName, lastName, email, password, role } = userData;
   const salt = await bcrypt.genSalt(10);
   const hashedPassword = await bcrypt.hash(password, salt);
   const query = `
   INSERT INTO users (first_name, last_name, email, password_hash, role)
   VALUES ($1, $2, $3, $4, $5)
   RETURNING id, email, role, first_name, last_name;
   `;
   const values = [firstName, lastName, email, hashedPassword, role]; 
   const { rows } = await db.query(query, values);
   return rows[0];
};

const getAllUsers = async () => {
    const query = 'SELECT id, first_name, last_name, login, role FROM users ORDER BY id ASC'; 
    const { rows } = await db.query(query);
    return rows;
};

const findUserById = async (id) => {
    const query = 'SELECT * FROM users WHERE id = $1';
    const { rows } = await db.query(query, [id]); 
    return rows[0] || null;
};

module.exports = {
    findUserByLogin,
    findUserWithRoleById,
    findUserByEmail,
    createUser,
    getAllUsers,
    findUserById
};
    // Функции updateUserById и deleteUserById были в вашем коде, но не экспортировались.
    // Если они нужны, их тоже нужно добавить сюда и исправить в них передачу параметров в db.query.


*/

/*

const db = require('../config/db');
    const bcrypt = require('bcryptjs');

    const findUserByLogin = async (login) => {
    //
    const { rows } = await db.query('SELECT * FROM users WHERE login = $1', [login]); 
    // Возвращаем первый элемент массива или undefined, если массив пуст
    return rows[0]; 
};


    module.exports = { findUserByLogin };

const findUser = async (id) => {
            // Важно: Не возвращаем password_hash!
            // Также делаем JOIN, чтобы сразу получить роль пользователя
            const query = `
                SELECT u.id, u.login, e.full_name, 'teacher' as role
                FROM users u
                JOIN employees e ON u.id = e.user_id
                WHERE u.id = $1
                UNION
                SELECT u.id, u.login, s.full_name, 'student' as role
                FROM users u
                JOIN students s ON u.id = s.user_id
                WHERE u.id = $1;
            `;
            const { rows } = await db.query(query, [id]);
            return rows[0];
        };


       // Найти пользователя по email (для проверки уникальности)
       const findUserByEmail = async (email) => {
           const query = 'SELECT * FROM users WHERE email = $1';
           const { rows } = await db.query(query, [email]);
           return rows[0];
        };
        // Создать нового пользователя
        const createUser = async (userData) => {
           const { firstName, lastName, email, password, role } = userData;
           // Хешируем пароль перед сохранением
           const salt = await bcrypt.genSalt(10);
           const hashedPassword = await bcrypt.hash(password, salt);
           const query = `
           INSERT INTO users (first_name, last_name, email, password_hash, role)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, email, role, first_name, last_name; -- Возвращаем данные без хеша пароля
           `;
           const values = [firstName, lastName, email, hashedPassword, role];

           try {
                 const { rows } = await db.query(query, values);
                 return rows[0];
           } catch (error) {
                console.error('Ошибка при создании пользователя в БД:', error);
                // Перебрасываем ошибку, чтобы контроллер мог ее обработать
                throw error;
           }
           };

          // Получить всех пользователей (без хешей паролей для безопасности)
          const getAllUsers = async () => {
              const query = 'SELECT id, first_name, last_name, email, role FROM users ORDER BY id ASC';
              const { rows } = await db.query(query);
              return rows;
          };

          // Найти пользователя по ID (понадобится для проверок)
          const findUserById = async (id) => {
              const query = 'SELECT * FROM users WHERE id = $1';
              const { rows } = await db.query(query, [id]);
              return rows[0];
          };

          // Обновить пользователя по ID
          const updateUserById = async (id, userData) => {
          const { firstName, lastName, email, role, password } = userData;
    
          // Динамически строим запрос, чтобы обновлять только переданные поля
          const fields = [];
          const values = [];
          let queryPart = '';
          let paramIndex = 1;

          if (firstName) { fields.push(`first_name = $${paramIndex++}`); values.push(firstName); }
          if (lastName) { fields.push(`last_name = $${paramIndex++}`); values.push(lastName); }
          if (email) { fields.push(`email = $${paramIndex++}`); values.push(email); }
          if (role) { fields.push(`role = $${paramIndex++}`); values.push(role); }
 
          // Особая обработка пароля: хешируем, только если он был предоставлен
          if (password) {
              const salt = await bcrypt.genSalt(10);
              const hashedPassword = await bcrypt.hash(password, salt);
              fields.push(`password_hash = $${paramIndex++}`);
              values.push(hashedPassword);
          }

          if (fields.length === 0) {
                 // Если ничего не передано на обновление, возвращаем null или ошибку
             throw new Error("Нет данных для обновления");
          }

          queryPart = fields.join(', ');
          values.push(id); // Добавляем ID в конец для условия WHERE

          const query = `
              UPDATE users SET ${queryPart} WHERE id = $${paramIndex}
              RETURNING id, first_name, last_name, email, role;
              `;

          const { rows } = await db.query(query, values);
          return rows[0];
         };

      // Удалить пользователя по ID
      const deleteUserById = async (id) => {
           const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
           const { rows } = await db.query(query, [id]);
           return rows[0];
        };



module.exports = {
    findUserByLogin, 
    findUser,
    findUserByEmail,
    createUser,
    getAllUsers,
    findUserById,
    updateUserById,
    deleteUserById
};

      
    
        */