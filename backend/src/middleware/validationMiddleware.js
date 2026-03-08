// backend/src/middleware/validationMiddleware.js
const Joi = require('joi');

class ValidationMiddleware {
    /**
     * Валидация запроса на предпросмотр
     */
    validateDocumentJobPreview(req, res, next) {
        const schema = Joi.object({
            searchText: Joi.string()
                .min(1)
                .max(1000)
                .required()
                .messages({
                    'string.empty': 'Текст для поиска не может быть пустым',
                    'string.min': 'Текст для поиска должен содержать хотя бы 1 символ',
                    'string.max': 'Текст для поиска не может превышать 1000 символов',
                    'any.required': 'Текст для поиска обязателен'
                }),
            
            filters: Joi.object({
                departmentIds: Joi.array().items(Joi.number().integer().positive()),
                disciplineIds: Joi.array().items(Joi.number().integer().positive()),
                eduProgramIds: Joi.array().items(Joi.number().integer().positive()),
                sessionIds: Joi.array().items(Joi.number().integer().positive()),
                eduProgramByDepartmentIds: Joi.array().items(Joi.number().integer().positive()),
                disciplineByEduProgramIds: Joi.array().items(Joi.number().integer().positive()),
                documentTypeIds: Joi.array().items(Joi.number().integer().positive())
            })
            .min(1)
            .required()
            .messages({
                'object.min': 'Необходимо указать хотя бы один фильтр',
                'any.required': 'Фильтры обязательны'
            })
        });
        
        const { error } = schema.validate(req.body, { abortEarly: false });
        
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            
            return res.status(400).json({
                error: 'Ошибка валидации',
                details: errors
            });
        }
        
        next();
    }
    
    /**
     * Валидация запроса на создание задания
     */
    validateDocumentJobCreate(req, res, next) {
        const schema = Joi.object({
            searchText: Joi.string()
                .min(1)
                .max(1000)
                .required()
                .messages({
                    'string.empty': 'Текст для поиска не может быть пустым',
                    'string.min': 'Текст для поиска должен содержать хотя бы 1 символ',
                    'string.max': 'Текст для поиска не может превышать 1000 символов',
                    'any.required': 'Текст для поиска обязателен'
                }),
            
            replaceText: Joi.string()
                .max(1000)
                .allow('')
                .required()
                .messages({
                    'string.max': 'Текст для замены не может превышать 1000 символов',
                    'any.required': 'Текст для замены обязателен'
                }),
            
            filters: Joi.object({
                departmentIds: Joi.array().items(Joi.number().integer().positive()),
                disciplineIds: Joi.array().items(Joi.number().integer().positive()),
                eduProgramIds: Joi.array().items(Joi.number().integer().positive()),
                sessionIds: Joi.array().items(Joi.number().integer().positive()),
                eduProgramByDepartmentIds: Joi.array().items(Joi.number().integer().positive()),
                disciplineByEduProgramIds: Joi.array().items(Joi.number().integer().positive()),
                documentTypeIds: Joi.array().items(Joi.number().integer().positive())
            })
            .min(1)
            .required()
            .messages({
                'object.min': 'Необходимо указать хотя бы один фильтр',
                'any.required': 'Фильтры обязательны'
            })
        });
        
        const { error } = schema.validate(req.body, { abortEarly: false });
        
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            
            return res.status(400).json({
                error: 'Ошибка валидации',
                details: errors
            });
        }
        
        next();
    }
    
    /**
     * Валидация параметров запроса для получения заданий
     */
    validateGetJobs(req, res, next) {
        const schema = Joi.object({
            status: Joi.string().valid('pending', 'in_progress', 'completed', 'failed', 'cancelled'),
            limit: Joi.number().integer().min(1).max(100).default(50),
            offset: Joi.number().integer().min(0).default(0)
        });
        
        const { error } = schema.validate(req.query, { abortEarly: false });
        
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            
            return res.status(400).json({
                error: 'Ошибка валидации',
                details: errors
            });
        }
        
        next();
    }
    
    /**
     * Валидация ID задания
     */
    validateJobId(req, res, next) {
        const schema = Joi.object({
            id: Joi.number().integer().positive().required()
        });
        
        const { error } = schema.validate(req.params, { abortEarly: false });
        
        if (error) {
            return res.status(400).json({
                error: 'Неверный формат ID задания'
            });
        }
        
        next();
    }
    
    /**
     * Валидация ID документа
     */
    validateDocumentId(req, res, next) {
        const schema = Joi.object({
            documentId: Joi.number().integer().positive().required()
        });
        
        const { error } = schema.validate(req.params, { abortEarly: false });
        
        if (error) {
            return res.status(400).json({
                error: 'Неверный формат ID документа'
            });
        }
        
        next();
    }
    
    /**
     * Проверка прав доступа для создания заданий
     */
    async checkEditPermissions(req, res, next) {
        try {
            const userId = req.user.id;
            
            // Проверяем, является ли пользователь сотрудником
            const employeeResult = await req.db.query(
                'SELECT id, role_id FROM employees WHERE user_id = $1',
                [userId]
            );
            
            if (employeeResult.rows.length === 0) {
                return res.status(403).json({
                    error: 'Доступ запрещен. Только сотрудники могут создавать задания'
                });
            }
            
            const employee = employeeResult.rows[0];
            
            // Проверяем права доступа (например, только администраторы и редакторы)
            // Здесь можно добавить более сложную логику проверки прав
            const allowedRoles = [1, 2]; // Например, ID ролей администратора и редактора
            
            if (!allowedRoles.includes(employee.role_id)) {
                return res.status(403).json({
                    error: 'Недостаточно прав для создания заданий массового редактирования'
                });
            }
            
            next();
            
        } catch (error) {
            console.error('Ошибка при проверке прав доступа:', error);
            res.status(500).json({
                error: 'Ошибка при проверке прав доступа'
            });
        }
    }
    
    /**
     * Проверка прав доступа для отмены задания
     */
    async checkCancelPermissions(req, res, next) {
        try {
            const userId = req.user.id;
            const jobId = req.params.id;
            
            // Проверяем, является ли пользователь создателем задания или администратором
            const jobResult = await req.db.query(
                `SELECT dej.created_by_employee_id, e.role_id
                 FROM document_edit_jobs dej
                 JOIN employees e ON dej.created_by_employee_id = e.id
                 WHERE dej.id = $1`,
                [jobId]
            );
            
            if (jobResult.rows.length === 0) {
                return res.status(404).json({
                    error: 'Задание не найдено'
                });
            }
            
            const job = jobResult.rows[0];
            
            // Проверяем текущего пользователя
            const currentUserResult = await req.db.query(
                'SELECT id, role_id FROM employees WHERE user_id = $1',
                [userId]
            );
            
            if (currentUserResult.rows.length === 0) {
                return res.status(403).json({
                    error: 'Доступ запрещен'
                });
            }
            
            const currentUser = currentUserResult.rows[0];
            
            // Разрешаем отмену если:
            // 1. Пользователь - создатель задания
            // 2. Пользователь - администратор (role_id = 1)
            const isCreator = currentUser.id === job.created_by_employee_id;
            const isAdmin = currentUser.role_id === 1;
            
            if (!isCreator && !isAdmin) {
                return res.status(403).json({
                    error: 'Недостаточно прав для отмены этого задания'
                });
            }
            
            next();
            
        } catch (error) {
            console.error('Ошибка при проверке прав на отмену:', error);
            res.status(500).json({
                error: 'Ошибка при проверке прав доступа'
            });
        }
    }
}

module.exports = new ValidationMiddleware();