// frontend/src/views/DocumentBatchEditorView.vue 
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
      <h2 class="panel-title">Массовое редактирование документов</h2>
      
      <!-- Шаг 1: Определение замены -->
      <div class="form-section">
        <h3 class="section-title">1. Определение замены</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Найти текст:</label>
            <textarea 
              v-model="searchText" 
              rows="3" 
              placeholder="Введите текст, который нужно найти..."
              :class="{ 'error': validationErrors.searchText }"
            ></textarea>
            <div v-if="validationErrors.searchText" class="error-message">
              {{ validationErrors.searchText }}
            </div>
          </div>
          
          <div class="form-group">
            <label>Заменить на:</label>
            <textarea 
              v-model="replaceText" 
              rows="3" 
              placeholder="Введите текст для замены..."
            ></textarea>
            <div class="hint">
              Оставьте пустым, чтобы удалить найденный текст
            </div>
          </div>
        </div>
      </div>
      
      <!-- Шаг 2: Выбор области действия -->
      <div class="form-section">
        <h3 class="section-title">2. Область поиска</h3>
        
        <div class="filters-grid">
          <!-- Фильтр по кафедрам -->
          <div class="filter-group">
            <label>Кафедры:</label>
            <div class="filter-options">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="selectAllDepartments"
                  @change="toggleAllDepartments"
                >
                <span>Выбрать все</span>
              </label>
              <div class="scrollable-list">
                <label 
                  v-for="dept in departments" 
                  :key="dept.id"
                  class="checkbox-label"
                >
                  <input 
                    type="checkbox" 
                    :value="dept.id" 
                    v-model="filters.departmentIds"
                  >
                  <span>{{ dept.name }}</span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Фильтр по дисциплинам -->
          <div class="filter-group">
            <label>Дисциплины:</label>
            <div class="filter-options">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="selectAllDisciplines"
                  @change="toggleAllDisciplines"
                >
                <span>Выбрать все</span>
              </label>
              <div class="scrollable-list">
                <label 
                  v-for="disc in disciplines" 
                  :key="disc.id"
                  class="checkbox-label"
                >
                  <input 
                    type="checkbox" 
                    :value="disc.id" 
                    v-model="filters.disciplineIds"
                  >
                  <span>{{ disc.name }}</span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Фильтр по типам документов -->
          <div class="filter-group">
            <label>Типы документов:</label>
            <div class="filter-options">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="selectAllDocumentTypes"
                  @change="toggleAllDocumentTypes"
                >
                <span>Выбрать все</span>
              </label>
              <div class="scrollable-list">
                <label 
                  v-for="type in documentTypes" 
                  :key="type.id"
                  class="checkbox-label"
                >
                  <input 
                    type="checkbox" 
                    :value="type.id" 
                    v-model="filters.documentTypeIds"
                  >
                  <span>{{ type.name }}</span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Фильтр по образовательным программам -->
          <div class="filter-group">
            <label>Образовательные программы:</label>
            <div class="filter-options">
              <div class="scrollable-list">
                <label 
                  v-for="program in eduPrograms" 
                  :key="program.id"
                  class="checkbox-label"
                >
                  <input 
                    type="checkbox" 
                    :value="program.id" 
                    v-model="filters.eduProgramIds"
                  >
                  <span>{{ program.department_name }} - {{ program.name }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="validationErrors.filters" class="error-message">
          {{ validationErrors.filters }}
        </div>
      </div>
      
      <!-- Кнопки действий -->
      <div class="action-buttons">
        <button 
          @click="previewChanges" 
          class="btn-primary" 
          :disabled="!searchText || isLoading"
        >
          {{ isLoading ? 'Загрузка...' : 'Предпросмотр изменений' }}
        </button>
        
        <button 
          @click="resetForm" 
          class="btn-secondary"
          :disabled="isLoading"
        >
          Сбросить
        </button>
      </div>
      
      <!-- Шаг 3: Предпросмотр -->
      <div v-if="previewData" class="preview-section">
        <h3 class="section-title">3. Предпросмотр изменений</h3>
        
        <div class="preview-stats">
          <div class="stat-card">
            <div class="stat-value">{{ previewData.statistics.totalDocuments }}</div>
            <div class="stat-label">Всего документов</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ previewData.statistics.documentsWithMatches }}</div>
            <div class="stat-label">Документов с совпадениями</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ previewData.statistics.totalMatches }}</div>
            <div class="stat-label">Всего замен</div>
          </div>
        </div>
        
        <!-- Поиск по документам -->
        <div class="document-search">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Поиск по названию документа..."
            class="search-input"
          >
          <div class="search-actions">
            <button 
              @click="sortBy = sortBy === 'name' ? '-name' : 'name'"
              class="btn-icon"
              title="Сортировать по названию"
            >
              <i class="icon">📄</i>
            </button>
            <button 
              @click="sortBy = sortBy === 'matches' ? '-matches' : 'matches'"
              class="btn-icon"
              title="Сортировать по количеству замен"
            >
              <i class="icon">🔢</i>
            </button>
          </div>
        </div>
        
        <!-- Список документов -->
        <div class="document-list-container">
          <div v-if="filteredPreviewDocs.length === 0" class="empty-list-message">
            Документы не найдены
          </div>
          
          <div 
            v-for="doc in filteredPreviewDocs" 
            :key="doc.id"
            class="document-item"
            :class="{ 'selected': selectedDoc?.id === doc.id }"
            @click="viewDocument(doc)"
          >
            <div class="document-header">
              <span class="document-name">{{ doc.name }}</span>
              <span class="document-type">{{ doc.document_type }}</span>
            </div>
            <div class="document-info">
              <span class="matches-badge" v-if="doc.matches > 0">
                {{ doc.matches }} замен
              </span>
              <span class="no-matches" v-else>
                Совпадений не найдено
              </span>
              <button 
                @click.stop="viewDocument(doc)"
                class="btn-small"
              >
                Просмотр
              </button>
            </div>
            <div class="document-preview" v-if="doc.preview">
              {{ doc.preview }}
            </div>
          </div>
        </div>
        
        <!-- Кнопка запуска -->
        <div class="launch-section">
          <div class="confirmation-checkbox">
            <label>
              <input type="checkbox" v-model="confirmed">
              Я подтверждаю, что хочу выполнить замену в {{ previewData.statistics.documentsWithMatches }} документах
            </label>
          </div>
          
          <button 
            @click="startJob" 
            class="btn-success" 
            :disabled="!confirmed || isStartingJob"
          >
            {{ isStartingJob ? 'Запуск...' : `Запустить редактирование (${previewData.statistics.documentsWithMatches} документов)` }}
          </button>
        </div>
      </div>
      
      <!-- Шаг 4: Мониторинг выполнения -->
      <div v-if="activeJob" class="job-monitoring">
        <h3 class="section-title">4. Мониторинг выполнения</h3>
        
        <div class="job-info">
          <div class="job-header">
            <h4>Задание #{{ activeJob.jobId }}</h4>
            <span class="job-status" :class="activeJob.status">
              {{ getStatusText(activeJob.status) }}
            </span>
          </div>
          
          <div class="job-details">
            <div class="detail">
              <span class="label">Поиск:</span>
              <span class="value">{{ activeJob.searchText }}</span>
            </div>
            <div class="detail">
              <span class="label">Замена:</span>
              <span class="value">{{ activeJob.replaceText || '(удаление)' }}</span>
            </div>
            <div class="detail">
              <span class="label">Создано:</span>
              <span class="value">{{ formatDate(activeJob.timestamps.created) }}</span>
            </div>
          </div>
          
          <!-- Прогресс бар -->
          <div class="progress-section">
            <div class="progress-header">
              <span>Прогресс выполнения</span>
              <span>{{ activeJob.progress.percentage }}%</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: `${activeJob.progress.percentage}%` }"
              ></div>
            </div>
            <div class="progress-stats">
              <span>Обработано: {{ activeJob.progress.processed }}/{{ activeJob.progress.total }}</span>
              <span>Успешно: {{ activeJob.statistics.success }}</span>
              <span>Ошибок: {{ activeJob.statistics.failed }}</span>
            </div>
          </div>
          
          <!-- Статистика -->
          <div class="job-statistics">
            <div class="stat-item">
              <div class="stat-number">{{ activeJob.statistics.success }}</div>
              <div class="stat-label">Успешно</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ activeJob.statistics.failed }}</div>
              <div class="stat-label">Ошибок</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ activeJob.statistics.skipped }}</div>
              <div class="stat-label">Пропущено</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ activeJob.statistics.total }}</div>
              <div class="stat-label">Всего</div>
            </div>
          </div>
          
          <!-- Логи -->
          <div class="job-logs">
            <h5>Логи выполнения</h5>
            <div class="logs-container">
              <div 
                v-for="log in activeJob.logs" 
                :key="log.id"
                class="log-entry"
                :class="log.status"
              >
                <div class="log-header">
                  <span class="log-document">{{ log.document_name }}</span>
                  <span class="log-status">{{ getStatusText(log.status) }}</span>
                </div>
                <div v-if="log.message" class="log-message">
                  {{ log.message }}
                </div>
                <div class="log-time">
                  {{ formatTime(log.created_at) }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Действия -->
          <div class="job-actions">
            <button 
              @click="refreshJobStatus" 
              class="btn-secondary"
              :disabled="isRefreshing"
            >
              {{ isRefreshing ? 'Обновление...' : 'Обновить статус' }}
            </button>
            
            <button 
              v-if="canCancelJob(activeJob)"
              @click="cancelJob"
              class="btn-danger"
              :disabled="isCancelling"
            >
              {{ isCancelling ? 'Отмена...' : 'Отменить задание' }}
            </button>
            
            <button 
              v-if="activeJob.status === 'completed'"
              @click="downloadReport"
              class="btn-primary"
            >
              Скачать отчет
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно просмотра документа -->
    <DocumentViewerModal
      v-if="selectedDoc"
      :document="selectedDoc"
      :search-text="searchText"
      @close="closeViewer"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useToast } from 'vue-toastification';
import DocumentViewerModal from '../components/DocumentViewerModal.vue';
import api from '../api';

const toast = useToast();

// --- Реактивные переменные ---
const searchText = ref('');
const replaceText = ref('');
const filters = ref({
  departmentIds: [],
  disciplineIds: [],
  documentTypeIds: [],
  eduProgramIds: [],
  eduProgramByDepartmentIds: [],
  disciplineByEduProgramIds: []
});

const validationErrors = ref({});
const isLoading = ref(false);
const isStartingJob = ref(false);
const isRefreshing = ref(false);
const isCancelling = ref(false);
const confirmed = ref(false);

// Данные для фильтров
const departments = ref([]);
const disciplines = ref([]);
const documentTypes = ref([]);
const eduPrograms = ref([]);

// Состояния выбора "все"
const selectAllDepartments = ref(false);
const selectAllDisciplines = ref(false);
const selectAllDocumentTypes = ref(false);

// Предпросмотр
const previewData = ref(null);
const searchQuery = ref('');
const sortBy = ref('name');

// Активное задание
const activeJob = ref(null);
const selectedDoc = ref(null);

// Таймер для обновления статуса
let statusInterval = null;

// --- Computed свойства ---
const filteredPreviewDocs = computed(() => {
  if (!previewData.value?.documents) return [];
  
  let docs = [...previewData.value.documents];
  
  // Фильтрация по поисковому запросу
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    docs = docs.filter(doc => 
      doc.name.toLowerCase().includes(query) ||
      doc.document_type.toLowerCase().includes(query)
    );
  }
  
  // Сортировка
  if (sortBy.value) {
    const [field, direction] = sortBy.value.startsWith('-') 
      ? [sortBy.value.slice(1), -1] 
      : [sortBy.value, 1];
    
    docs.sort((a, b) => {
      if (field === 'matches') {
        return (a.matches - b.matches) * direction;
      } else if (field === 'name') {
        return a.name.localeCompare(b.name) * direction;
      }
      return 0;
    });
  }
  
  return docs;
});

// --- Хуки жизненного цикла ---
onMounted(async () => {
  await loadFilterData();
  
  // Проверяем, есть ли активное задание в localStorage
  const savedJobId = localStorage.getItem('lastJobId');
  if (savedJobId) {
    await loadJobStatus(savedJobId);
  }
});

onUnmounted(() => {
  if (statusInterval) {
    clearInterval(statusInterval);
  }
});

// --- Методы ---
async function loadFilterData() {
  try {
    const data = await api.get('/document-jobs/filters');
    departments.value = data.departments;
    disciplines.value = data.disciplines;
    documentTypes.value = data.documentTypes;
    eduPrograms.value = data.eduPrograms;
  } catch (error) {
    console.error('Ошибка при загрузке данных фильтров:', error);
    toast.error('Не удалось загрузить данные фильтров');
  }
}

function toggleAllDepartments() {
  if (selectAllDepartments.value) {
    filters.value.departmentIds = departments.value.map(d => d.id);
  } else {
    filters.value.departmentIds = [];
  }
}

function toggleAllDisciplines() {
  if (selectAllDisciplines.value) {
    filters.value.disciplineIds = disciplines.value.map(d => d.id);
  } else {
    filters.value.disciplineIds = [];
  }
}

function toggleAllDocumentTypes() {
  if (selectAllDocumentTypes.value) {
    filters.value.documentTypeIds = documentTypes.value.map(t => t.id);
  } else {
    filters.value.documentTypeIds = [];
  }
}

function validateForm() {
  const errors = {};
  
  if (!searchText.value.trim()) {
    errors.searchText = 'Введите текст для поиска';
  }
  
  const hasFilters = Object.values(filters.value).some(arr => arr.length > 0);
  if (!hasFilters) {
    errors.filters = 'Выберите хотя бы один фильтр';
  }
  
  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
}

async function previewChanges() {
  if (!validateForm()) return;
  
  isLoading.value = true;
  
  try {
    const response = await api.post('/document-jobs/preview', {
      searchText: searchText.value,
      filters: filters.value
    });
    
    previewData.value = response;
    toast.success(`Найдено ${response.statistics.totalDocuments} документов`);
    
  } catch (error) {
    console.error('Ошибка при предпросмотре:', error);
    
    if (error.response?.data?.error) {
      toast.error(error.response.data.error);
    } else {
      toast.error('Ошибка при предпросмотре изменений');
    }
  } finally {
    isLoading.value = false;
  }
}

async function startJob() {
  if (!confirmed.value) {
    toast.warning('Подтвердите выполнение операции');
    return;
  }
  
  isStartingJob.value = true;
  
  try {
    const response = await api.post('/document-jobs', {
      searchText: searchText.value,
      replaceText: replaceText.value,
      filters: filters.value
    });
    
    toast.success('Задание успешно создано');
    
    // Загружаем статус созданного задания
    await loadJobStatus(response.jobId);
    
    // Сохраняем ID задания
    localStorage.setItem('lastJobId', response.jobId);
    
    // Сбрасываем предпросмотр
    previewData.value = null;
    confirmed.value = false;
    
  } catch (error) {
    console.error('Ошибка при создании задания:', error);
    
    if (error.response?.data?.error) {
      toast.error(error.response.data.error);
    } else {
      toast.error('Ошибка при создании задания');
    }
  } finally {
    isStartingJob.value = false;
  }
}

async function loadJobStatus(jobId) {
  isRefreshing.value = true;
  
  try {
    const response = await api.get(`/document-jobs/${jobId}`);
    activeJob.value = response;
    
    // Если задание еще выполняется, запускаем периодическое обновление
    if (response.status === 'pending' || response.status === 'in_progress') {
      startStatusPolling(jobId);
    } else {
      stopStatusPolling();
    }
    
  } catch (error) {
    console.error('Ошибка при загрузке статуса задания:', error);
    toast.error('Не удалось загрузить статус задания');
  } finally {
    isRefreshing.value = false;
  }
}

function startStatusPolling(jobId) {
  stopStatusPolling();
  
  statusInterval = setInterval(async () => {
    try {
      const response = await api.get(`/document-jobs/${jobId}`);
      activeJob.value = response;
      
      // Если задание завершено, останавливаем опрос
      if (response.status === 'completed' || response.status === 'failed' || response.status === 'cancelled') {
        stopStatusPolling();
        
        if (response.status === 'completed') {
          toast.success('Задание успешно выполнено');
        } else if (response.status === 'failed') {
          toast.error('Задание завершено с ошибкой');
        }
      }
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
    }
  }, 5000); // Обновляем каждые 5 секунд
}

function stopStatusPolling() {
  if (statusInterval) {
    clearInterval(statusInterval);
    statusInterval = null;
  }
}

async function refreshJobStatus() {
  if (activeJob.value) {
    await loadJobStatus(activeJob.value.jobId);
  }
}

async function cancelJob() {
  if (!activeJob.value || !canCancelJob(activeJob.value)) return;
  
  if (!confirm('Вы уверены, что хотите отменить это задание?')) return;
  
  isCancelling.value = true;
  
  try {
    await api.post(`/document-jobs/${activeJob.value.jobId}/cancel`);
    toast.success('Задание отменено');
    await loadJobStatus(activeJob.value.jobId);
  } catch (error) {
    console.error('Ошибка при отмене задания:', error);
    toast.error('Не удалось отменить задание');
  } finally {
    isCancelling.value = false;
  }
}

function canCancelJob(job) {
  return job.status === 'pending' || job.status === 'in_progress';
}

function downloadReport() {
  // Реализация скачивания отчета
  toast.info('Функция скачивания отчета в разработке');
}

function viewDocument(doc) {
  selectedDoc.value = doc;
}

function closeViewer() {
  selectedDoc.value = null;
}

function resetForm() {
  searchText.value = '';
  replaceText.value = '';
  filters.value = {
    departmentIds: [],
    disciplineIds: [],
    documentTypeIds: [],
    eduProgramIds: []
  };
  previewData.value = null;
  validationErrors.value = {};
  confirmed.value = false;
  selectAllDepartments.value = false;
  selectAllDisciplines.value = false;
  selectAllDocumentTypes.value = false;
}

function getStatusText(status) {
  const statusMap = {
    'pending': 'Ожидание',
    'in_progress': 'В процессе',
    'completed': 'Завершено',
    'failed': 'Ошибка',
    'cancelled': 'Отменено',
    'success': 'Успешно',
    'skipped': 'Пропущено'
  };
  
  return statusMap[status] || status;
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('ru-RU');
}

function formatTime(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleTimeString('ru-RU');
}

// Наблюдаем за изменениями фильтров
watch(() => filters.value.departmentIds, (newVal) => {
  selectAllDepartments.value = newVal.length === departments.value.length;
});

watch(() => filters.value.disciplineIds, (newVal) => {
  selectAllDisciplines.value = newVal.length === disciplines.value.length;
});

watch(() => filters.value.documentTypeIds, (newVal) => {
  selectAllDocumentTypes.value = newVal.length === documentTypes.value.length;
});
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

