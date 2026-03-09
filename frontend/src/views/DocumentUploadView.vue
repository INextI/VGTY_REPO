
<template>
<header>
  <div class="header-container">
    <div class="header-left">
      <div class="logo">
        <router-link to="/student/home">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Vstu_logo.svg/640px-Vstu_logo.svg.png"
            alt="ВГТУ" width="24" height="34">
        </router-link>
      </div>
    </div>
    <div class="header-right">
      <button class="icon" title="Поиск" @click="toggleSearch">
        <i class="fas fa-search"></i>
      </button>
      <button class="icon" title="Уведомления" @click="toggleNotifications">
        <i class="fas fa-bell"></i>
        <span v-if="unreadNotifications > 0" class="notification-badge">
          {{ unreadNotifications }}
        </span>
      </button>
      <button class="icon" title="Чат" @click="openChat">
        <i class="fas fa-comments"></i>
      </button>
      <div class="user-info">
        <span>{{ userName }}</span>
        <router-link to="/student/profile" class="user-avatar">
          <i class="fas fa-user"></i>
        </router-link>
      </div>
    </div>
  </div>
</header>
<div class="main-content">
  <div class="panel">
    <h2 class="panel-title">Загрузка документов</h2>
    
    <!-- Отладочная информация -->
    <div v-if="debugInfo" class="debug-info">
      <h3>Отладочная информация:</h3>
      <div class="debug-stats">
        <div>Типы документов: {{ documentTypes.length }}</div>
        <div>Кафедры: {{ departments.length }}</div>
        <div>Дисциплины: {{ disciplines.length }}</div>
        <div>Программы: {{ eduPrograms.length }}</div>
        <div>Сессии: {{ sessions.length }}</div>
      </div>
      <button @click="toggleDebug" class="btn-small">
        {{ showDebug ? 'Скрыть детали' : 'Показать детали' }}
      </button>
      <div v-if="showDebug" class="debug-details">
        <pre>{{ JSON.stringify(debugData, null, 2) }}</pre>
      </div>
    </div>
    
    <form @submit.prevent="uploadDocument" class="upload-form">
      <div class="form-section">
        <h3 class="section-title">Основная информация</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Выберите файл</label>
            <input
              type="file"
              ref="fileInput"
              @change="handleFileSelect"
              class="form-control"
              accept=".docx,.txt,.pdf,.md,.html,.htm"
              multiple
            >
            <div class="hint">Поддерживаемые форматы: DOCX, TXT, PDF, MD, HTML</div>
          </div>
          <div class="form-group">
            <label>Тип документа</label>
            <select v-model="documentTypeId" class="select-control" required>
              <option value="">Выберите тип документа</option>
              <option v-for="type in documentTypes" :key="type.id" :value="type.id">
                {{ type.name }}
              </option>
            </select>
            <div v-if="documentTypes.length === 0" class="error-text">
              Нет доступных типов документов
            </div>
          </div>
        </div>
      </div>
      <div class="form-section">
        <h3 class="section-title">Привязка к сущности</h3>
        <div class="form-group">
          <label>Тип привязки</label>
          <div class="entity-selection">
            <div class="checkbox-label">
              <input
                type="radio"
                id="department"
                v-model="entityType"
                value="department"
                class="form-check-input"
              >
              <label class="form-check-label" for="department">Кафедра</label>
            </div>
            <div class="checkbox-label">
              <input
                type="radio"
                id="discipline"
                v-model="entityType"
                value="discipline"
                class="form-check-input"
              >
              <label class="form-check-label" for="discipline">Дисциплина</label>
            </div>
            <div class="checkbox-label">
              <input
                type="radio"
                id="program"
                v-model="entityType"
                value="program"
                class="form-check-input"
              >
              <label class="form-check-label" for="program">Образовательная программа</label>
            </div>
            <div class="checkbox-label">
              <input
                type="radio"
                id="session"
                v-model="entityType"
                value="session"
                class="form-check-input"
              >
              <label class="form-check-label" for="session">Сессия</label>
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group" v-if="entityType === 'department'">
            <label>Выберите кафедру</label>
            <select v-model="departmentId" class="select-control">
              <option value="">Выберите кафедру</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
            <div v-if="departments.length === 0" class="error-text">
              Нет доступных кафедр
            </div>
          </div>
          <div class="form-group" v-if="entityType === 'discipline'">
            <label>Выберите дисциплину</label>
            <select v-model="disciplineId" class="select-control">
              <option value="">Выберите дисциплину</option>
              <option v-for="disc in disciplines" :key="disc.id" :value="disc.id">
                {{ disc.name }}
              </option>
            </select>
            <div v-if="disciplines.length === 0" class="error-text">
              Нет доступных дисциплин
            </div>
          </div>
          <div class="form-group" v-if="entityType === 'program'">
            <label>Выберите образовательную программу</label>
            <select v-model="programId" class="select-control">
              <option value="">Выберите программу</option>
              <option v-for="program in eduPrograms" :key="program.id" :value="program.id">
                {{ program.name }} ({{ program.department_name }})
              </option>
            </select>
            <div v-if="eduPrograms.length === 0" class="error-text">
              Нет доступных программ
            </div>
          </div>
          <div class="form-group" v-if="entityType === 'session'">
            <label>Выберите сессию</label>
            <select v-model="sessionId" class="select-control">
              <option value="">Выберите сессию</option>
              <option v-for="session in sessions" :key="session.id" :value="session.id">
                {{ session.discipline_name }} - {{ session.session_date }} ({{ session.session_type }})
              </option>
            </select>
            <div v-if="sessions.length === 0" class="error-text">
              Нет доступных сессий
            </div>
          </div>
        </div>
      </div>
      <div class="form-section">
        <h3 class="section-title">Дополнительная информация</h3>
        <div class="form-group">
          <label>Описание документа (необязательно)</label>
          <textarea
            v-model="description"
            class="form-control"
            rows="3"
            placeholder="Введите описание документа..."
          ></textarea>
        </div>
      </div>
      <div class="upload-progress" v-if="uploadProgress > 0">
        <div class="progress-section">
          <div class="progress-header">
            <span>Прогресс загрузки</span>
            <span>{{ uploadProgress }}%</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: uploadProgress + '%' }"
            ></div>
          </div>
          <div class="progress-stats">
            <span>{{ processedFiles }} из {{ selectedFiles.length }} файлов</span>
            <span>{{ uploadProgress }}% загружено</span>
          </div>
        </div>
      </div>
      <div class="action-buttons">
        <button
          type="submit"
          class="btn-primary"
          :disabled="!selectedFiles.length || uploading || !documentTypeId"
        >
          <span v-if="uploading">
            <span class="loading-spinner-small"></span> Загрузка...
          </span>
          <span v-else>Загрузить документы</span>
        </button>
        <button
          type="button"
          class="btn-secondary"
          @click="resetForm"
          :disabled="uploading"
        >
          Сбросить
        </button>
        <button
          type="button"
          class="btn-small"
          @click="reloadData"
          :disabled="loading"
        >
          <span v-if="loading">
            <span class="loading-spinner-small"></span> Загрузка...
          </span>
          <span v-else>Обновить данные</span>
        </button>
      </div>
    </form>
    <div v-if="uploadResults.length > 0" class="upload-results mt-4">
      <h3 class="section-title">Результаты загрузки</h3>
      <div class="document-list-container">
        <div class="document-item" v-for="result in uploadResults" :key="result.fileName">
          <div class="document-header">
            <span class="document-name">{{ result.fileName }}</span>
            <span :class="'document-type ' + result.status">
              {{ result.status === 'success' ? 'Успешно' : 'Ошибка' }}
            </span>
          </div>
          <div class="document-info">
            <span class="document-preview">{{ result.message }}</span>
            <span v-if="result.documentId" class="matches-badge">
              ID: {{ result.documentId }}
            </span>
            <span v-else class="no-matches">Нет ID</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import $api from '@/api';
import router from '@/router';

export default {
  name: 'DocumentUpload',
  data() {
    return {
      selectedFiles: [],
      documentTypeId: '',
      entityType: 'department',
      departmentId: '',
      disciplineId: '',
      programId: '',
      sessionId: '',
      description: '',
      uploading: false,
      uploadProgress: 0,
      processedFiles: 0,
      uploadResults: [],
      // Данные для выпадающих списков
      documentTypes: [],
      departments: [],
      disciplines: [],
      eduPrograms: [],
      sessions: [],
      // Данные пользователя
      userName: 'Студент',
      unreadNotifications: 0,
      // Отладка
      debugInfo: true,
      showDebug: false,
      debugData: {},
      loading: false,
      errors: []
    }
  },
  async created() {
    await this.loadReferenceData();
    this.loadUserData();
  },
  methods: {
    async loadReferenceData() {
      this.loading = true;
      this.errors = [];
      
      try {
        // Определяем базовый URL API
        const baseURL = process.env.VUE_APP_API_URL || '';
        
        // Создаем массив промисов для параллельной загрузки
        const requests = [
          this.fetchData('/documentType', 'documentTypes'),
          this.fetchData('/department', 'departments'),
          this.fetchData('/discipline', 'disciplines'),
          this.fetchData('/eduProgramm', 'eduPrograms'),
          this.fetchData('/session', 'sessions')
        ];
        
        await Promise.all(requests);
        
        // Сохраняем отладочные данные
        this.debugData = {
          documentTypes: this.documentTypes,
          departments: this.departments,
          disciplines: this.disciplines,
          eduPrograms: this.eduPrograms,
          sessions: this.sessions,
          baseURL,
          timestamp: new Date().toISOString()
        };
        
        console.log('Данные успешно загружены:', this.debugData);
        
      } catch (error) {
        console.error('Ошибка загрузки справочных данных:', error);
        this.errors.push('Не удалось загрузить справочные данные');
        this.showError('Не удалось загрузить справочные данных. Проверьте консоль для деталей.');
      } finally {
        this.loading = false;
      }
    },
    
    // DocumentUpload.vue
async fetchData(endpoint, dataKey) {
  try {
    console.log(`Запрос данных с эндпоинта: ${endpoint}`);
    const response = await $api.get(endpoint); // $api уже знает базовый URL
    
    // Проверяем, что в ответе есть данные и это массив
    if (response.data && Array.isArray(response.data)) {
      this[dataKey] = response.data;
      console.log(`Успешно загружено ${this[dataKey].length} записей для "${dataKey}"`);
    } else {
      console.warn(`Получен неожиданный формат данных для "${dataKey}":`, response.data);
      this[dataKey] = []; // Устанавливаем пустой массив в случае неверного формата
    }
  } catch (error) {
    console.error(`Ошибка при загрузке данных для "${dataKey}" с эндпоинта ${endpoint}:`, error);
    this.errors.push(`Не удалось загрузить данные для ${dataKey}`);
    this[dataKey] = []; // Устанавливаем пустой массив в случае ошибки
  }
}
,
    
    async reloadData() {
      await this.loadReferenceData();
      if (this.errors.length === 0) {
        this.showSuccess('Данные успешно обновлены');
      }
    },
    
    loadUserData() {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        this.userName = user.name || 'Студент';
        this.unreadNotifications = user.unreadNotifications || 0;
      } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error);
      }
    },
    
    handleFileSelect(event) {
      this.selectedFiles = Array.from(event.target.files);
    },
    
    async uploadDocument() {
      if (!this.selectedFiles.length) {
        this.showError('Выберите хотя бы один файл');
        return;
      }
      
      if (!this.documentTypeId) {
        this.showError('Выберите тип документа');
        return;
      }
      
      this.uploading = true;
      this.uploadProgress = 0;
      this.processedFiles = 0;
      this.uploadResults = [];
      
      const totalFiles = this.selectedFiles.length;
      
      for (const file of this.selectedFiles) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('typeId', this.documentTypeId);
          formData.append('description', this.description);
          
          // Добавляем привязку к сущности
          switch (this.entityType) {
            case 'department':
              if (this.departmentId) formData.append('departmentId', this.departmentId);
              break;
            case 'discipline':
              if (this.disciplineId) formData.append('disciplineId', this.disciplineId);
              break;
            case 'program':
              if (this.programId) formData.append('eduProgramId', this.programId);
              break;
            case 'session':
              if (this.sessionId) formData.append('sessionId', this.sessionId);
              break;
          }
          
          console.log('Отправка файла:', file.name, 'FormData:', Object.fromEntries(formData));
          
          const response = await $api.post('/documents/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          console.log('Ответ от сервера:', response.data);
          
          this.uploadResults.push({
            fileName: file.name,
            status: 'success',
            message: 'Файл успешно загружен',
            documentId: response.data.documentId || response.data.id || 'N/A'
          });
          
        } catch (error) {
          console.error('Ошибка загрузки файла:', error);
          const errorMessage = error.response?.data?.error || 
                              error.response?.data?.message || 
                              error.message || 
                              'Ошибка загрузки';
          
          this.uploadResults.push({
            fileName: file.name,
            status: 'error',
            message: errorMessage,
            documentId: null
          });
        }
        
        this.processedFiles++;
        this.uploadProgress = Math.round((this.processedFiles / totalFiles) * 100);
      }
      
      this.uploading = false;
      
      // Показываем общий результат
      const successCount = this.uploadResults.filter(r => r.status === 'success').length;
      if (successCount === totalFiles) {
        this.showSuccess(`Все ${totalFiles} файлов успешно загружены`);
        this.resetForm();
      } else if (successCount > 0) {
        this.showWarning(`Загружено ${successCount} из ${totalFiles} файлов`);
      } else {
        this.showError('Не удалось загрузить ни одного файла');
      }
    },
    
    resetForm() {
      this.selectedFiles = [];
      this.documentTypeId = '';
      this.entityType = 'department';
      this.departmentId = '';
      this.disciplineId = '';
      this.programId = '';
      this.sessionId = '';
      this.description = '';
      this.uploadResults = [];
      this.uploadProgress = 0;
      this.processedFiles = 0;
      
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },
    
    toggleDebug() {
      this.showDebug = !this.showDebug;
    },
    
    // Методы для header
    toggleSearch() {
      console.log('Поиск');
    },
    
    toggleNotifications() {
      router.push('/student/notifications');
    },
    
    openChat() {
      router.push('/student/chat');
    },
    
    showError(message) {
      alert(`Ошибка: ${message}`);
    },
    
    showSuccess(message) {
      alert(`Успех: ${message}`);
    },
    
    showWarning(message) {
      alert(`Внимание: ${message}`);
    }
  }
}
</script>

<style scoped>
/* Стили компонента */
.main-content {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.panel {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.panel-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 32px;
  color: #333;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 32px 0 16px;
  color: #555;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

.form-section {
  margin-bottom: 32px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}

textarea:focus {
  outline: none;
  border-color: #4a6cf7;
  box-shadow: 0 0 0 2px rgba(74, 108, 247, 0.1);
}

textarea.error {
  border-color: #ff4757;
}

.error-message {
  color: #ff4757;
  font-size: 12px;
  margin-top: 4px;
}

.hint {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.filter-group {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.filter-group label {
  display: block;
  margin-bottom: 12px;
  font-weight: 500;
  color: #555;
}

.filter-options {
  max-height: 300px;
  overflow-y: auto;
}

.scrollable-list {
  max-height: 250px;
  overflow-y: auto;
  padding-right: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  padding: 6px 0;
  cursor: pointer;
  font-size: 14px;
}

.checkbox-label input {
  margin-right: 8px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-primary, .btn-secondary, .btn-success, .btn-danger, .btn-small, .btn-icon {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #4a6cf7;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #3a5ce5;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f8f9fa;
  color: #555;
  border: 1px solid #ddd;
}

.btn-secondary:hover:not(:disabled) {
  background: #e9ecef;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #218838;
}

.btn-danger {
  background: #ff4757;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #ff3742;
}

.btn-small {
  padding: 4px 12px;
  font-size: 12px;
}

.btn-icon {
  padding: 8px;
  background: none;
  color: #555;
}

.preview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.stat-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #4a6cf7;
}

.stat-label {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.document-search {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.search-actions {
  display: flex;
  gap: 8px;
}

.document-list-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 24px;
}

.document-item {
  padding: 16px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.document-item:hover {
  background-color: #f8f9fa;
}

.document-item.selected {
  background-color: #e8f4ff;
  border-left: 3px solid #4a6cf7;
}

.document-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.document-name {
  font-weight: 500;
  color: #333;
}

.document-type {
  font-size: 12px;
  color: #888;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 12px;
}

.document-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.matches-badge {
  background: #28a745;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.no-matches {
  color: #888;
  font-size: 12px;
}

.document-preview {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.empty-list-message {
  text-align: center;
  padding: 40px;
  color: #888;
  font-style: italic;
}

.launch-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.confirmation-checkbox {
  margin-bottom: 16px;
}

.confirmation-checkbox label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #555;
}

.job-monitoring {
  margin-top: 40px;
  padding-top: 32px;
  border-top: 2px solid #eee;
}

.job-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 24px;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.job-header h4 {
  margin: 0;
  color: #333;
}

.job-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.job-status.pending {
  background: #ffc107;
  color: #333;
}

.job-status.in_progress {
  background: #17a2b8;
  color: white;
}

.job-status.completed {
  background: #28a745;
  color: white;
}

.job-status.failed {
  background: #ff4757;
  color: white;
}

.job-status.cancelled {
  background: #6c757d;
  color: white;
}

.job-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.detail {
  display: flex;
  flex-direction: column;
}

.detail .label {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
}

.detail .value {
  font-weight: 500;
  color: #333;
  word-break: break-word;
}

.progress-section {
  margin-bottom: 24px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
}

.progress-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: #4a6cf7;
  transition: width 0.3s ease;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #888;
}

.job-statistics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

</style> 

