const { Sequelize } = require('sequelize');
const DocumentEditJob = require('../models/documentEditJobs');
const DocumentEditJobLog = require('../models/documentEditJobLogs');
const DocumentAttachment = require('../models/documentAttachments');
const { processDocumentReplacement } = require('./documentService');

class DocumentJobProcessor {
  constructor() {
    this.isProcessing = false;
    this.processingInterval = null;
  }

  /**
   * Запуск обработчика заданий
   */
  start() {
    console.log('🚀 Запуск обработчика заданий массового редактирования');
    
    // Проверяем задания каждые 5 секунд
    this.processingInterval = setInterval(() => {
      this.processPendingJobs();
    }, 5000);

    // Немедленная проверка при запуске
    this.processPendingJobs();
  }

  /**
   * Остановка обработчика
   */
  stop() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    console.log('🛑 Остановка обработчика заданий');
  }

  /**
   * Обработка ожидающих заданий
   */
  async processPendingJobs() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      // Находим задания со статусом 'pending'
      const pendingJobs = await DocumentEditJob.findAll({
        where: {
          status: 'pending'
        },
        order: [['created_at', 'ASC']],
        limit: 1 // Обрабатываем по одному заданию за раз
      });

      for (const job of pendingJobs) {
        await this.processJob(job);
      }
    } catch (error) {
      console.error('❌ Ошибка при обработке заданий:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Обработка конкретного задания
   */
  async processJob(job) {
    const transaction = await DocumentEditJob.sequelize.transaction();

    try {
      console.log(`🔄 Начало обработки задания ${job.id}`);

      // Обновляем статус задания на 'in_progress'
      await job.update({
        status: 'in_progress',
        started_at: new Date()
      }, { transaction });

      // Получаем документы для обработки на основе фильтров
      const documents = await this.getDocumentsForProcessing(job.filter_criteria);
      
      // Обновляем общее количество документов
      await job.update({
        total_count: documents.length
      }, { transaction });

      console.log(`📄 Найдено ${documents.length} документов для обработки`);

      let successCount = 0;
      let failedCount = 0;
      let skippedCount = 0;

      // Обрабатываем каждый документ
      for (const document of documents) {
        try {
          console.log(`📝 Обработка документа: ${document.name} (ID: ${document.id})`);

          // Создаем лог для документа - используем 'success' как начальный статус
          const log = await DocumentEditJobLog.create({
            job_id: job.id,
            document_attachment_id: document.id,
            status: 'success',
            message: 'Начало обработки',
            created_at: new Date()
          }, { transaction });

          try {
            // Выполняем замену текста в документе
            const result = await processDocumentReplacement(
              document.id,
              job.search_text,
              job.replace_text
            );

            if (result.success) {
              // Успешная замена
              await log.update({
                status: 'success',
                message: `Успешно заменено ${result.replacements} вхождений`,
                original_document_id_backup: result.backupId
              }, { transaction });

              successCount++;
              console.log(`✅ Документ ${document.name} успешно обработан`);
            } else {
              // Документ не содержит искомый текст
              await log.update({
                status: 'skipped',
                message: 'Текст для замены не найден в документе'
              }, { transaction });

              skippedCount++;
              console.log(`⚠️ Документ ${document.name} пропущен (текст не найден)`);
            }
          } catch (docError) {
            // Ошибка при обработке документа
            await log.update({
              status: 'failed',
              message: `Ошибка обработки: ${docError.message}`
            }, { transaction });

            failedCount++;
            console.error(`❌ Ошибка при обработке документа ${document.name}:`, docError);
          }

        } catch (logError) {
          console.error('❌ Ошибка при создании лога:', logError);
          failedCount++;
        }

        // Обновляем счетчики прогресса
        const processedCount = successCount + failedCount + skippedCount;
        await job.update({
          processed_count: processedCount,
          success_count: successCount,
          failed_count: failedCount,
          skipped_count: skippedCount
        }, { transaction });
      }

      // Завершаем задание - используем 'completed' или 'failed'
      const finalStatus = failedCount === 0 ? 'completed' : 'failed'; 
      await job.update({
        status: finalStatus,
        completed_at: new Date()
      }, { transaction });

      await transaction.commit();

      console.log(`🎉 Задание ${job.id} завершено со статусом: ${finalStatus}`);
      console.log(`📊 Статистика: Успешно: ${successCount}, Ошибок: ${failedCount}, Пропущено: ${skippedCount}`);

    } catch (error) {
      await transaction.rollback();
      
      // Обновляем статус задания на 'failed'
      await job.update({
        status: 'failed',
        completed_at: new Date()
      });

      console.error(`💥 Критическая ошибка при обработке задания ${job.id}:`, error);
    }
  }

  /**
   * Получение документов для обработки на основе фильтров
   */
  async getDocumentsForProcessing(filterCriteria) {
    const filters = typeof filterCriteria === 'string' 
      ? JSON.parse(filterCriteria) 
      : filterCriteria;

    const whereConditions = {};

    // Добавляем условия фильтрации
    if (filters.disciplineIds && filters.disciplineIds.length > 0) {
      whereConditions.discipline_id = {
        [Sequelize.Op.in]: filters.disciplineIds
      };
    }

    if (filters.documentTypeIds && filters.documentTypeIds.length > 0) {
      whereConditions.type_id = {
        [Sequelize.Op.in]: filters.documentTypeIds
      };
    }

    // Получаем документы
    const documents = await DocumentAttachment.findAll({
      where: whereConditions,
      attributes: ['id', 'name', 'type_id', 'discipline_id']
    });

    return documents;
  }

  /**
   * Принудительная обработка конкретного задания
   */
  async forceProcessJob(jobId) {
    const job = await DocumentEditJob.findByPk(jobId);
    if (!job) {
      throw new Error(`Задание ${jobId} не найдено`);
    }

    if (job.status === 'completed' || job.status === 'failed') {
      throw new Error(`Задание уже завершено со статусом: ${job.status}`);
    }

    await this.processJob(job);
  }
}

module.exports = new DocumentJobProcessor();