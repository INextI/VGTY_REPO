// controllers/documentAttachmentController.js
const documentAttachmentService = require('../services/documentAttachmentService');
const upload = require('../config/multer'); 


class DocumentAttachmentController {
   async create(req, res, next) {
    try {
      console.log('=== НАЧАЛО ОБРАБОТКИ ЗАПРОСА ===');
      console.log('Метод:', req.method);
      console.log('URL:', req.url);
      console.log('Заголовки:', req.headers);
       if (!req.body) {
      console.error('❌ Multer не подключен! req.body = undefined');
      return res.status(500).json({ 
        error: 'Multer middleware не подключен к маршруту',
        solution: 'Добавьте upload.single(\'doc\') в маршрут /documentAttachment'
      });
    }
      // Проверяем, что это multipart/form-data
      const contentType = req.headers['content-type'];
      console.log('Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('multipart/form-data')) {
        console.log('❌ Неверный Content-Type');
        return res.status(400).json({ error: 'Content-Type должен быть multipart/form-data' });
      }

      // Теперь req.body должен быть заполнен multer
      console.log('Тело запроса (req.body):', req.body);
      console.log('Файл (req.file):', req.file ? {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        encoding: req.file.encoding,
        mimetype: req.file.mimetype,
        size: req.file.size,
        buffer: req.file.buffer ? `Buffer[${req.file.buffer.length}]` : 'null'
      } : 'null');

      // Проверяем обязательные поля
      const missingFields = [];
      
      if (!req.body.name) {
        missingFields.push('name');
        console.log('❌ Отсутствует поле name');
      }
      if (!req.body.type_id) {
        missingFields.push('type_id');
        console.log('❌ Отсутствует поле type_id');
      }
      if (!req.file) {
        missingFields.push('doc (файл)');
        console.log('❌ Отсутствует файл');
      }

      if (missingFields.length > 0) {
        return res.status(400).json({ 
          error: `Отсутствуют обязательные поля: ${missingFields.join(', ')}` 
        });
      }

      // Проверяем привязку к сущности
      const entityFields = ['department_id', 'discipline_id', 'edu_program_id', 'session_id'];
      const providedEntities = [];
      
      entityFields.forEach(field => {
        if (req.body[field]) {
          providedEntities.push(field);
          console.log(`✅ Найдена сущность: ${field} = ${req.body[field]}`);
        }
      });

      console.log('Найдено сущностей:', providedEntities.length, providedEntities);

      if (providedEntities.length !== 1) {
        return res.status(400).json({
          error: `Документ должен быть привязан ровно к одной сущности. Найдено: ${providedEntities.length}. Поля: ${providedEntities.join(', ')}`
        });
      }

      // Создаем документ
      const documentData = {
        name: req.body.name,
        type_id: req.body.type_id,
        doc: req.file.buffer,
        department_id: req.body.department_id || null,
        discipline_id: req.body.discipline_id || null,
        edu_program_id: req.body.edu_program_id || null,
        session_id: req.body.session_id || null,
        description: req.body.description || null
      };

      console.log('Создаем документ с данными:', {
        ...documentData,
        doc: `Buffer[${documentData.doc?.length || 0}]`
      });

      const attachment = await documentAttachmentService.create(documentData);
      console.log('✅ Документ создан успешно:', attachment.id);
      
      return res.status(201).json(attachment);
    } catch (e) {
      console.error('❌ Ошибка в контроллере:', e);
      console.error('Stack trace:', e.stack);
      
      // Более детальная информация об ошибках Sequelize
      if (e.name === 'SequelizeValidationError') {
        const errors = e.errors.map(err => ({
          field: err.path,
          message: err.message,
          value: err.value
        }));
        console.error('Ошибки валидации:', errors);
        return res.status(400).json({ 
          error: 'Ошибка валидации данных',
          details: errors 
        });
      }
      
      next(e);
    }
  }

    async getAll(req, res, next) {
        try {
            const attachments = await documentAttachmentService.getAll();
            return res.status(200).json(attachments);
        } catch (e) {
            next(e);
        }
    }
    async getById(req, res, next) {
        try {
            const attachment = await documentAttachmentService.getById(req.params.id);
            if (!attachment) {
                return res.status(404).json({ message: 'Вложение документа не найдено' });
            }
            return res.status(200).json(attachment);
        } catch (e) {
            next(e);
        }
    }

    async update(req, res, next) {
        try {
            const attachment = await documentAttachmentService.update(req.params.id, req.body);
            if (!attachment) {
                return res.status(404).json({ message: 'Вложение документа не найдено' });
            }
            return res.status(200).json(attachment);
        } catch (e) {
            next(e);
        }
    }

    async delete(req, res, next) {
        try {
            const result = await documentAttachmentService.delete(req.params.id);
            if (!result) {
                return res.status(404).json({ message: 'Вложение документа не найдено' });
            }
            return res.status(204).send();
        } catch (e) {
            next(e);
        }
    }

    async getByDepartmentId(req, res, next) {
        try {
            const attachments = await documentAttachmentService.getByDepartmentId(req.params.departmentId);
            return res.status(200).json(attachments);
        } catch (e) {
            next(e);
        }
    }

    async getByDisciplineId(req, res, next) {
        try {
            const attachments = await documentAttachmentService.getByDisciplineId(req.params.disciplineId);
            return res.status(200).json(attachments);
        } catch (e) {
            next(e);
        }
    }

    async getBySessionId(req, res, next) {
        try {
            const attachments = await documentAttachmentService.getBySessionId(req.params.sessionId);
            return res.status(200).json(attachments);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new DocumentAttachmentController();