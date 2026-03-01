
<template>
  <div class="check-works-page">
    <!-- Header -->
    <header>
      <div class="header-container">
        <div class="header-left">
          <div class="logo">
            <router-link to="/teacher/home">
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
            <router-link to="/teacher/profile" class="user-avatar">
              <i class="fas fa-user"></i>
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="container">
      <!-- Dashboard -->
      <div class="dashboard">
        <!-- Dashboard Header -->
        <div class="dashboard-header">
          <div class="assignment-selector">
            <label for="assignmentSelect">Лабораторная работа:</label>
            <select id="assignmentSelect" v-model="selectedAssignment" @change="loadAssignmentData">
              <option v-for="assignment in assignments" :key="assignment.id" :value="assignment.id">
                {{ assignment.name }}
              </option>
            </select>
          </div>
          <div class="deadline-info">
            <i class="fas fa-clock"></i>
            <span>Конец сдачи: <strong>{{ selectedAssignmentInfo.deadline }}</strong></span>
          </div>
          <div class="stats-summary">
            <div class="stat-item">
              <i class="fas fa-users"></i>
              <span>{{ students.length }} студентов</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-check-circle"></i>
              <span>{{ gradedCount }} оценено</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-clock"></i>
              <span>{{ pendingCount }} ожидает</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-times-circle"></i>
              <span>{{ notSubmittedCount }} не сдано</span>
            </div>
          </div>
        </div>

        <!-- Controls -->
        <div class="dashboard-controls">
          <button class="control-btn close-report" @click="closeReport">
            <i class="fas fa-times"></i> Закрыть отчет
          </button>
          <div class="control-actions">
            <button class="control-btn secondary" @click="exportGrades">
              <i class="fas fa-download"></i> Экспорт оценок
            </button>
            <button class="control-btn secondary" @click="sendReminders">
              <i class="fas fa-bell"></i> Напомнить о сроке
            </button>
            <button class="control-btn primary" @click="gradeAll">
              <i class="fas fa-star"></i> Оценить всех
            </button>
          </div>
        </div>

        <!-- Students Table -->
        <div class="table-container">
          <div class="table-header">
            <h3><i class="fas fa-list"></i> Список работ студентов</h3>
            <div class="table-search">
              <input type="text" v-model="searchQuery" placeholder="Поиск по имени или группе...">
              <i class="fas fa-search"></i>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th @click="sortBy('name')" :class="{ 'sorted': sortField === 'name' }">
                  <span>Студент</span>
                  <i class="fas" :class="sortIcon('name')"></i>
                </th>
                <th @click="sortBy('group')" :class="{ 'sorted': sortField === 'group' }">
                  <span>Группа</span>
                  <i class="fas" :class="sortIcon('group')"></i>
                </th>
                <th @click="sortBy('status')" :class="{ 'sorted': sortField === 'status' }">
                  <span>Статус</span>
                  <i class="fas" :class="sortIcon('status')"></i>
                </th>
                <th @click="sortBy('grade')" :class="{ 'sorted': sortField === 'grade' }">
                  <span>Оценка</span>
                  <i class="fas" :class="sortIcon('grade')"></i>
                </th>
                <th @click="sortBy('submittedAt')" :class="{ 'sorted': sortField === 'submittedAt' }">
                  <span>Дата сдачи</span>
                  <i class="fas" :class="sortIcon('submittedAt')"></i>
                </th>
                <th>Комментарий</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in filteredStudents" :key="student.id" 
                  :class="{
                    'graded': student.status === 'graded',
                    'pending': student.status === 'pending',
                    'not-submitted': student.status === 'not-submitted',
                    'selected': selectedStudent?.id === student.id
                  }"
                  @click="selectStudent(student)">
                <td class="student-info">
                  <div class="avatar" :style="{ backgroundColor: getAvatarColor(student.id) }">
                    {{ getInitials(student.name) }}
                  </div>
                  <div class="student-details">
                    <strong>{{ student.name }}</strong>
                    <span class="email">{{ student.email }}</span>
                  </div>
                </td>
                <td>
                  <span class="group-badge">{{ student.group }}</span>
                </td>
                <td>
                  <span class="status-badge" :class="student.status">
                    <i class="fas" :class="getStatusIcon(student.status)"></i>
                    {{ getStatusText(student.status) }}
                  </span>
                </td>
                <td>
                  <div v-if="student.status === 'graded'" class="grade-display">
                    <span class="grade-value">{{ student.grade }}</span>
                    <span class="grade-max">/100</span>
                  </div>
                  <div v-else-if="student.status === 'pending'" class="grade-input">
                    <input type="number" 
                           v-model.number="student.tempGrade" 
                           min="0" 
                           max="100" 
                           placeholder="0-100"
                           @click.stop>
                  </div>
                  <span v-else class="no-grade">—</span>
                </td>
                <td>
                  <span v-if="student.submittedAt" class="date-info">
                    <i class="fas fa-calendar"></i>
                    {{ formatDate(student.submittedAt) }}
                  </span>
                  <span v-else class="no-date">Не сдано</span>
                </td>
                <td>
                  <div class="comment-preview" v-if="student.comment">
                    {{ truncateText(student.comment, 50) }}
                  </div>
                  <span v-else class="no-comment">—</span>
                </td>
                <td>
                  <div class="action-buttons" @click.stop>
                    <button v-if="student.files && student.files.length > 0" 
                            class="action-btn" 
                            @click="viewFiles(student)"
                            title="Просмотреть файлы">
                      <i class="fas fa-file"></i>
                    </button>
                    <button class="action-btn" 
                            @click="openCommentModal(student)"
                            :title="student.comment ? 'Изменить комментарий' : 'Добавить комментарий'">
                      <i class="fas" :class="student.comment ? 'fa-edit' : 'fa-comment'"></i>
                    </button>
                    <button v-if="student.status === 'pending'" 
                            class="action-btn grade-btn"
                            @click="gradeStudent(student)"
                            title="Оценить работу">
                      <i class="fas fa-star"></i>
                    </button>
                    <button v-if="student.status === 'graded'" 
                            class="action-btn edit-grade"
                            @click="editGrade(student)"
                            title="Изменить оценку">
                      <i class="fas fa-edit"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Empty State -->
          <div v-if="filteredStudents.length === 0" class="empty-table">
            <div class="empty-icon">
              <i class="fas fa-search"></i>
            </div>
            <h3>Студенты не найдены</h3>
            <p>Попробуйте изменить параметры поиска</p>
          </div>
        </div>

        <!-- Student Details Panel -->
        <div v-if="selectedStudent" class="student-details-panel">
          <div class="panel-header">
            <h3>
              <i class="fas fa-user-graduate"></i>
              {{ selectedStudent.name }}
              <span class="group-tag">{{ selectedStudent.group }}</span>
            </h3>
            <button class="close-panel-btn" @click="deselectStudent">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="panel-content">
            <!-- Student Files -->
            <div class="files-section">
              <h4><i class="fas fa-file"></i> Прикрепленные файлы</h4>
              <div v-if="selectedStudent.files && selectedStudent.files.length > 0" class="file-list">
                <div v-for="(file, index) in selectedStudent.files" :key="index" class="file-item">
                  <div class="file-icon">
                    <i class="fas" :class="getFileIcon(file.type)"></i>
                  </div>
                  <div class="file-info">
                    <div class="file-name">{{ file.name }}</div>
                    <div class="file-meta">
                      <span class="file-size">{{ formatFileSize(file.size) }}</span>
                      <span class="file-date">{{ formatDate(file.uploadedAt) }}</span>
                    </div>
                  </div>
                  <div class="file-actions">
                    <button class="file-btn" @click="previewFile(file)" title="Предпросмотр">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="file-btn" @click="downloadFile(file)" title="Скачать">
                      <i class="fas fa-download"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="no-files">
                <i class="fas fa-folder-open"></i>
                <p>Нет прикрепленных файлов</p>
              </div>
            </div>

            <!-- Grading Form -->
            <div class="grading-section">
              <h4><i class="fas fa-star"></i> Оценивание</h4>
              <div class="grading-form">
                <div class="grade-input-group">
                  <label for="gradeInput">Оценка (0-100):</label>
                  <div class="grade-slider">
                    <input type="range" 
                           id="gradeInput" 
                           v-model.number="gradeValue" 
                           min="0" 
                           max="100" 
                           step="1"
                           class="grade-slider-input">
                    <div class="grade-slider-values">
                      <span>0</span>
                      <span>50</span>
                      <span>100</span>
                    </div>
                    <div class="grade-display-value">
                      <span class="grade-number">{{ gradeValue }}</span>
                      <span class="grade-max">/100</span>
                    </div>
                  </div>
                </div>

                <div class="grade-criteria">
                  <h5>Критерии оценки:</h5>
                  <div v-for="criterion in gradingCriteria" :key="criterion.id" class="criterion-item">
                    <label>
                      <input type="checkbox" 
                             v-model="selectedCriteria" 
                             :value="criterion.id"
                             class="criterion-checkbox">
                      <span class="criterion-text">{{ criterion.name }}</span>
                      <span class="criterion-points">({{ criterion.points }} баллов)</span>
                    </label>
                  </div>
                  <div class="total-points">
                    Итого: <strong>{{ calculateTotalPoints() }}</strong> баллов
                  </div>
                </div>
              </div>
            </div>

            <!-- Comment Section -->
            <div class="comment-section">
              <h4><i class="fas fa-comment"></i> Комментарий</h4>
              <div class="comment-editor">
                <textarea v-model="commentText" 
                          placeholder="Напишите комментарий к работе..." 
                          rows="4"
                          @input="autoResizeTextarea"
                          ref="commentTextarea"></textarea>
                <div class="comment-tools">
                  <button class="tool-btn" @click="insertTemplate('good')" title="Хорошая работа">
                    <i class="fas fa-thumbs-up"></i>
                  </button>
                  <button class="tool-btn" @click="insertTemplate('improve')" title="Требует доработки">
                    <i class="fas fa-wrench"></i>
                  </button>
                  <button class="tool-btn" @click="clearComment" title="Очистить">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div v-if="selectedStudent.comment" class="existing-comment">
                <h5>Текущий комментарий:</h5>
                <div class="comment-preview-box">
                  {{ selectedStudent.comment }}
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="panel-actions">
              <button class="panel-btn save-draft" @click="saveDraft">
                <i class="fas fa-save"></i>
                    Сохранить черновик
              </button>
              <button class="panel-btn submit-grade" @click="submitGrade" :disabled="!gradeValue">
                <i class="fas fa-check-circle"></i>
                Оценить работу
              </button>
            </div>
          </div>
        </div>

        <!-- Bulk Grading Panel -->
        <div v-if="showBulkGrading" class="bulk-grading-panel">
          <div class="panel-header">
            <h3><i class="fas fa-users"></i> Массовое оценивание</h3>
            <button class="close-panel-btn" @click="showBulkGrading = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="panel-content">
            <p>Выбрано студентов: {{ selectedStudentsCount }}</p>
            <div class="bulk-grade-input">
              <label for="bulkGrade">Оценка для всех:</label>
              <input type="number" id="bulkGrade" v-model.number="bulkGradeValue" min="0" max="100" placeholder="0-100">
            </div>
            <div class="bulk-actions">
              <button class="panel-btn secondary" @click="applyBulkGrade" :disabled="!bulkGradeValue">
                Применить оценку
              </button>
              <button class="panel-btn primary" @click="applyBulkGradeWithComments">
                Применить с комментариями
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Comment Modal -->
      <div v-if="showCommentModal" class="modal-overlay" @click="closeCommentModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3><i class="fas fa-comment"></i> Комментарий для {{ commentModalStudent?.name }}</h3>
            <button class="close-btn" @click="closeCommentModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <textarea v-model="modalCommentText" 
                      placeholder="Введите комментарий..." 
                      rows="6"
                      class="modal-textarea"></textarea>
            <div class="comment-templates">
              <button class="template-btn" @click="insertModalTemplate('good')">
                <i class="fas fa-thumbs-up"></i> Хорошая работа
              </button>
              <button class="template-btn" @click="insertModalTemplate('improve')">
                <i class="fas fa-wrench"></i> Требует доработки
              </button>
              <button class="template-btn" @click="insertModalTemplate('late')">
                <i class="fas fa-clock"></i> Сдано с опозданием
              </button>
            </div>
          </div>
          <div class="modal-footer">
            <button class="modal-btn cancel" @click="closeCommentModal">
              Отмена
            </button>
            <button class="modal-btn save" @click="saveComment">
              Сохранить
            </button>
          </div>
        </div>
      </div>

      <!-- Success Notification -->
      <div v-if="showSuccessNotification" class="success-notification">
        <i class="fas fa-check-circle"></i>
        <span>{{ successMessage }}</span>
        <button class="close-notification" @click="closeSuccessNotification">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

// Router and Store
const router = useRouter();
const authStore = useAuthStore();

// Refs
const unreadNotifications = ref(3);
const selectedAssignment = ref(1);
const searchQuery = ref('');
const sortField = ref('name');
const sortDirection = ref('asc');
const selectedStudent = ref(null);
const showCommentModal = ref(false);
const showBulkGrading = ref(false);
const showSuccessNotification = ref(false);
const successMessage = ref('');
const commentModalStudent = ref(null);
const modalCommentText = ref('');
const commentTextarea = ref(null);
const gradeValue = ref(0);
const commentText = ref('');
const selectedCriteria = ref([]);
const bulkGradeValue = ref(0);

// Data
const assignments = ref([
  { id: 1, name: 'Лабораторная работа 1', deadline: '12.12.2024 17:00', totalStudents: 45 },
  { id: 2, name: 'Лабораторная работа 2', deadline: '19.12.2024 17:00', totalStudents: 45 },
  { id: 3, name: 'Лабораторная работа 3', deadline: '26.12.2024 17:00', totalStudents: 45 },
  { id: 4, name: 'Лабораторная работа 4', deadline: '02.01.2025 17:00', totalStudents: 45 },
]);

const gradingCriteria = ref([
  { id: 1, name: 'Корректность выполнения', points: 30 },
  { id: 2, name: 'Полнота реализации', points: 25 },
  { id: 3, name: 'Качество кода', points: 20 },
  { id: 4, name: 'Оформление отчета', points: 15 },
  { id: 5, name: 'Своевременность сдачи', points: 10 },
]);

const students = ref([
  {
    id: 1,
    name: 'Иванов Иван',
    email: 'ivanov@edu.vstu.ru',
    group: 'ИС-101',
    status: 'pending',
    grade: null,
    tempGrade: null,
    submittedAt: '2024-06-12T14:30:00',
    comment: '',
    files: [
      { name: 'Лабораторная_1.docx', type: 'doc', size: 2048000, uploadedAt: '2024-06-12T14:30:00' },
      { name: 'код_программы.py', type: 'code', size: 5120, uploadedAt: '2024-06-12T14:30:00' }
    ]
  },
  {
    id: 2,
    name: 'Петров Петр',
    email: 'petrov@edu.vstu.ru',
    group: 'ИС-102',
    status: 'graded',
    grade: 85,
    tempGrade: 85,
    submittedAt: '2024-06-11T10:15:00',
    comment: 'Отличная работа, все требования выполнены полностью. Код хорошо структурирован.',
    files: [
      { name: 'ЛР1_Петров.zip', type: 'archive', size: 4096000, uploadedAt: '2024-06-11T10:15:00' }
    ]
  },
  {
    id: 3,
    name: 'Сидорова Анна',
    email: 'sidorova@edu.vstu.ru',
    group: 'ИС-101',
    status: 'not-submitted',
    grade: null,
    tempGrade: null,
    submittedAt: null,
    comment: '',
    files: []
  },
  {
    id: 4,
    name: 'Кузнецов Алексей',
    email: 'kuznetsov@edu.vstu.ru',
    group: 'ИС-103',
    status: 'pending',
    grade: null,
    tempGrade: null,
    submittedAt: '2024-06-13T09:45:00',
    comment: 'Требуется доработка по второму пункту задания.',
    files: [
      { name: 'lab1_report.pdf', type: 'pdf', size: 1536000, uploadedAt: '2024-06-13T09:45:00' }
    ]
  },
  {
    id: 5,
    name: 'Михайлова Елена',
    email: 'mikhailova@edu.vstu.ru',
    group: 'ИС-102',
    status: 'graded',
    grade: 92,
    tempGrade: 92,
    submittedAt: '2024-06-10T16:20:00',
    comment: 'Отличная работа! Очень креативный подход к решению.',
    files: [
      { name: 'LR1_Mikhailova.docx', type: 'doc', size: 2560000, uploadedAt: '2024-06-10T16:20:00' },
      { name: 'source_code.rar', type: 'archive', size: 1024000, uploadedAt: '2024-06-10T16:20:00' }
    ]
  },
  {
    id: 6,
    name: 'Смирнов Дмитрий',
    email: 'smirnov@edu.vstu.ru',
    group: 'ИС-101',
    status: 'not-submitted',
    grade: null,
    tempGrade: null,
    submittedAt: null,
    comment: '',
    files: []
  },
  {
    id: 7,
    name: 'Федорова Ольга',
    email: 'fedorova@edu.vstu.ru',
    group: 'ИС-103',
    status: 'pending',
    grade: null,
    tempGrade: null,
    submittedAt: '2024-06-13T23:59:00',
    comment: '',
    files: [
      { name: 'Лабораторная1_Федорова.zip', type: 'archive', size: 5120000, uploadedAt: '2024-06-13T23:59:00' }
    ]
  },
  {
    id: 8,
    name: 'Васильев Андрей',
    email: 'vasiliev@edu.vstu.ru',
    group: 'ИС-102',
    status: 'graded',
    grade: 78,
    tempGrade: 78,
    submittedAt: '2024-06-12T11:30:00',
    comment: 'Хорошая работа, но есть замечания по оформлению кода.',
    files: [
      { name: 'lab1_vasiliev.py', type: 'code', size: 8192, uploadedAt: '2024-06-12T11:30:00' },
      { name: 'отчет.docx', type: 'doc', size: 3072000, uploadedAt: '2024-06-12T11:30:00' }
    ]
  }
]);

// Computed properties
const userName = computed(() => {
  return authStore.user?.name || 'Иван Иванов';
});

const selectedAssignmentInfo = computed(() => {
  const assignment = assignments.value.find(a => a.id === selectedAssignment.value);
  return assignment || assignments.value[0];
});

const filteredStudents = computed(() => {
  let result = [...students.value];
  
  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(student => 
      student.name.toLowerCase().includes(query) ||
      student.group.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query)
    );
  }
  
  // Apply sorting
  if (sortField.value) {
    result.sort((a, b) => {
      let aValue = a[sortField.value];
      let bValue = b[sortField.value];
      
      // Handle null values
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';
      
      // Special handling for status field
      if (sortField.value === 'status') {
        const statusOrder = { 'graded': 1, 'pending': 2, 'not-submitted': 3 };
        aValue = statusOrder[a.status] || 4;
        bValue = statusOrder[b.status] || 4;
      }
      
      // Special handling for grade field
      if (sortField.value === 'grade') {
        aValue = a.grade === null ? -1 : a.grade;
        bValue = b.grade === null ? -1 : b.grade;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection.value === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection.value === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
    });
  }
  
  return result;
});

const gradedCount = computed(() => {
  return students.value.filter(s => s.status === 'graded').length;
});

const pendingCount = computed(() => {
  return students.value.filter(s => s.status === 'pending').length;
});

const notSubmittedCount = computed(() => {
  return students.value.filter(s => s.status === 'not-submitted').length;
});

const selectedStudentsCount = computed(() => {
  return students.value.filter(s => s.selected).length;
});

// Methods
const toggleSearch = () => {
  console.log('Открыть поиск');
};

const toggleNotifications = () => {
  unreadNotifications.value = 0;
  console.log('Показать уведомления');
};

const openChat = () => {
  console.log('Открыть чат');
};

const loadAssignmentData = () => {
  console.log('Загрузить данные для задания:', selectedAssignment.value);
  // Здесь должна быть загрузка данных по заданию с сервера
};

const closeReport = () => {
  if (confirm('Вы уверены, что хотите закрыть отчет?')) {
    console.log('Отчет закрыт');
    router.push('/teacher/courses');
  }
};

const exportGrades = () => {
  console.log('Экспорт оценок');
  showSuccess('Оценки экспортированы в Excel');
};

const sendReminders = () => {
  const notSubmitted = students.value.filter(s => s.status === 'not-submitted');
  if (notSubmitted.length === 0) {
    alert('Все студенты уже сдали работу или не осталось не сдавших');
    return;
  }
  
  if (confirm(`Отправить напоминания ${notSubmitted.length} студентам?`)) {
    console.log('Напоминания отправлены');
    showSuccess(`Напоминания отправлены ${notSubmitted.length} студентам`);
  }
};

const gradeAll = () => {
  showBulkGrading.value = true;
};

const sortBy = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortDirection.value = 'asc';
  }
};

const sortIcon = (field) => {
  if (sortField.value !== field) return 'fa-sort';
  return sortDirection.value === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
};

const selectStudent = (student) => {
  // Сохраняем выбранного студента
  selectedStudent.value = student;
  
  // Устанавливаем значения для оценки и комментария
  gradeValue.value = student.grade || 0;
  commentText.value = student.comment || '';
  
  // Сбрасываем выбранные критерии
  selectedCriteria.value = [];
  
  // Автоматически выбираем критерии на основе оценки
  if (student.grade !== null) {
    // Определяем какие критерии соответствуют оценке
    if (student.grade >= 90) {
      selectedCriteria.value = [1, 2, 3, 4, 5];
    } else if (student.grade >= 75) {
      selectedCriteria.value = [1, 2, 3, 4];
    } else if (student.grade >= 60) {
      selectedCriteria.value = [1, 2, 3];
    } else if (student.grade >= 1) {
      selectedCriteria.value = [1, 2];
    }
    // Если оценка 0, оставляем пустой массив
  }
  
  // Также устанавливаем временную оценку для редактирования
  student.tempGrade = student.grade || 0;
  
  // Прокручиваем к панели с деталями студента
  setTimeout(() => {
    const panel = document.querySelector('.student-details-panel');
    if (panel) {
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 100);
  
  console.log('Выбран студент:', student.name, 'Оценка:', student.grade);
};


const deselectStudent = () => {
  selectedStudent.value = null;
};

const getAvatarColor = (id) => {
  const colors = null;
  return colors;
};

const getInitials = (name) => {
  return name.split(' ').map(word => word).join('').toUpperCase();
};

const getStatusIcon = (status) => {
  switch(status) {
    case 'graded': return 'fa-check-circle';
    case 'pending': return 'fa-clock';
    case 'not-submitted': return 'fa-times-circle';
    default: return 'fa-question-circle';
  }
};

const getStatusText = (status) => {
  switch(status) {
    case 'graded': return 'Оценено';
    case 'pending': return 'Ожидает оценки';
    case 'not-submitted': return 'Не сдано';
    default: return status;
  }
};

const getFileIcon = (type) => {
  const icons = {
    'doc': 'fa-file-word',
    'pdf': 'fa-file-pdf',
    'code': 'fa-file-code',
    'archive': 'fa-file-archive',
    'image': 'fa-file-image',
    'excel': 'fa-file-excel'
  };
  return icons || 'fa-file';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = 0;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes;
};

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const viewFiles = (student) => {
  selectStudent(student);
  console.log('Просмотр файлов студента:', student.name);
};

const openCommentModal = (student) => {
  commentModalStudent.value = student;
  modalCommentText.value = student.comment || '';
  showCommentModal.value = true;
};

const closeCommentModal = () => {
  showCommentModal.value = false;
  commentModalStudent.value = null;
  modalCommentText.value = '';
};

const saveComment = () => {
  if (commentModalStudent.value) {
    commentModalStudent.value.comment = modalCommentText.value;
    console.log('Комментарий сохранен для студента:', commentModalStudent.value.name);
    showSuccess('Комментарий сохранен');
  }
  closeCommentModal();
};

const insertModalTemplate = (type) => {
  const templates = {
    good: 'Отличная работа! Все требования выполнены полностью. Код хорошо структурирован и документирован.',
    improve: 'Требуется доработка. Обратите внимание на следующие аспекты: ...',
    late: 'Работа сдана с опозданием. Учтите это при следующей сдаче.'
  };
  
  if (modalCommentText.value && !modalCommentText.value.endsWith('\n')) {
    modalCommentText.value += '\n';
  }
  modalCommentText.value += templates[type] || '';
};

const gradeStudent = (student) => {
  if (!student.tempGrade && student.tempGrade !== 0) {
    alert('Пожалуйста, введите оценку');
    return;
  }
  
  if (student.tempGrade < 0 || student.tempGrade > 100) {
    alert('Оценка должна быть в диапазоне от 0 до 100');
    return;
  }
  
  student.grade = student.tempGrade;
  student.status = 'graded';
  student.comment = student.comment || 'Оценено преподавателем';
  console.log('Студент оценен:', student.name, 'Оценка:', student.grade);
  showSuccess(`Студент ${student.name} оценен на ${student.grade} баллов`);
};

const editGrade = (student) => {
  selectStudent(student);
  // Фокус на панель с деталями студента
  setTimeout(() => {
    const panel = document.querySelector('.student-details-panel');
    if (panel) {
      panel.scrollIntoView({ behavior: 'smooth' });
    }
  }, 100);
};

const previewFile = (file) => {
  console.log('Предпросмотр файла:', file.name);
  alert(`Предпросмотр файла: ${file.name}\n\nВ реальном приложении здесь откроется просмотрщик файлов.`);
};

const downloadFile = (file) => {
  console.log('Скачивание файла:', file.name);
  // Здесь должна быть логика скачивания файла
  showSuccess(`Файл "${file.name}" скачан`);
};

const autoResizeTextarea = (event) => {
  const textarea = event.target;
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
};

const insertTemplate = (type) => {
  const templates = {
    good: 'Хорошая работа. Все требования выполнены корректно.\n',
    improve: 'Требуется доработка по следующим пунктам:\n1. ...\n2. ...\n'
  };
  
  if (commentText.value && !commentText.value.endsWith('\n')) {
    commentText.value += '\n';
  }
  commentText.value += templates[type] || '';
};

const clearComment = () => {
  commentText.value = '';
};

const calculateTotalPoints = () => {
  return selectedCriteria.value.reduce((total, criterionId) => {
    const criterion = gradingCriteria.value.find(c => c.id === criterionId);
    return total + (criterion ? criterion.points : 0);
  }, 0);
};

const saveDraft = () => {
  if (selectedStudent.value) {
    selectedStudent.value.tempGrade = gradeValue.value;
    selectedStudent.value.comment = commentText.value;
    console.log('Черновик сохранен для студента:', selectedStudent.value.name);
    showSuccess('Черновик сохранен');
  }
};

const submitGrade = () => {
  if (!selectedStudent.value) return;
  
  if (gradeValue.value < 0 || gradeValue.value > 100) {
    alert('Оценка должна быть в диапазоне от 0 до 100');
    return;
  }
  
  selectedStudent.value.grade = gradeValue.value;
  selectedStudent.value.status = 'graded';
  selectedStudent.value.comment = commentText.value || 'Оценено преподавателем';
  selectedStudent.value.tempGrade = gradeValue.value;
  
  console.log('Оценка сохранена:', selectedStudent.value.name, gradeValue.value);
  showSuccess(`Студент ${selectedStudent.value.name} оценен на ${gradeValue.value} баллов`);
  
  // Сброс формы
  commentText.value = '';
  selectedCriteria.value = [];
};

const applyBulkGrade = () => {
  if (!bulkGradeValue.value && bulkGradeValue.value !== 0) {
    alert('Введите оценку');
    return;
  }
  
  const pendingStudents = students.value.filter(s => s.status === 'pending');
  if (pendingStudents.length === 0) {
    alert('Нет студентов, ожидающих оценки');
    return;
  }
  
  if (confirm(`Применить оценку ${bulkGradeValue.value} к ${pendingStudents.length} студентам?`)) {
    pendingStudents.forEach(student => {
      student.grade = bulkGradeValue.value;
      student.status = 'graded';
      student.comment = student.comment || 'Оценено массово';
    });
    
    console.log('Массовое оценивание применено');
    showSuccess(`Оценка ${bulkGradeValue.value} применена к ${pendingStudents.length} студентам`);
    showBulkGrading.value = false;
    bulkGradeValue.value = 0;
  }
};

const applyBulkGradeWithComments = () => {
  if (!bulkGradeValue.value && bulkGradeValue.value !== 0) {
    alert('Введите оценку');
    return;
  }
  
  const pendingStudents = students.value.filter(s => s.status === 'pending');
  if (pendingStudents.length === 0) {
    alert('Нет студентов, ожидающих оценки');
    return;
  }
  
  // Открываем модальное окно для ввода комментария
  const comment = prompt('Введите общий комментарий для всех студентов:');
  if (comment === null) return; // Пользователь отменил
  
  pendingStudents.forEach(student => {
    student.grade = bulkGradeValue.value;
    student.status = 'graded';
    student.comment = comment;
  });
  
  console.log('Массовое оценивание с комментариями применено');
  showSuccess(`Оценка ${bulkGradeValue.value} с комментариями применена к ${pendingStudents.length} студентам`);
  showBulkGrading.value = false;
  bulkGradeValue.value = 0;
};

const showSuccess = (message) => {
  successMessage.value = message;
  showSuccessNotification.value = true;
  
  setTimeout(() => {
    showSuccessNotification.value = false;
  }, 5000);
};

const closeSuccessNotification = () => {
  showSuccessNotification.value = false;
};

// Lifecycle hooks
onMounted(() => {
  console.log('CheckWorksView загружен');
  // Загрузка данных при монтировании
  loadAssignmentData();
});

// Watchers
watch(gradeValue, (newValue) => {
  // Автоматически выбираем критерии на основе оценки
  if (newValue >= 90) {
    selectedCriteria.value = [1, 2, 3, 4, 5];
  } else if (newValue >= 75) {
    selectedCriteria.value = [1, 2, 3, 4];
  } else if (newValue >= 60) {
    selectedCriteria.value = [1, 2, 3];
  } else {
    selectedCriteria.value = [1, 2];
  }
});

watch(selectedStudent, (newStudent) => {
  if (newStudent) {
    gradeValue.value = newStudent.grade || 0;
    commentText.value = newStudent.comment || '';
  }
});
</script>

<style scoped>

/* ====== BASE ====== */
:root {
  --primary: #6940EE;
  --primary-hover: #4C2CB8;
  --success: #14C856;
  --danger: #FF4625;

  --bg-main: #FAFAFC;
  --bg-card: #FFFFFF;
  --border-soft: #F5F5F5;

  --text-main: #1D1D1D;
  --text-muted: #6F6F7A;

  --radius-lg: 20px;
  --radius-md: 16px;
  --shadow-soft: 0 6px 24px rgba(0,0,0,0.08);
  --shadow-hover: 0 12px 36px rgba(105,64,238,0.18);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg-main);
  font-family: "Roboto", Arial, sans-serif;
  color: var(--text-main);
}

a {
  text-decoration: none;
  color: var(--primary);
}

img {
  display: block;
  max-width: 100%;
}

/* ===== HEADER ===== */
header {
  background: #fff;
  border-bottom: 1px solid var(--border-soft);
  padding: 14px 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
}

.logo {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo a {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo img {
  filter: brightness(0) invert(1);
  width: 80%;
  height: 80%;
  object-fit: contain;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 14px;
}
.icon {
  background: none;
  border: none;
  font-size: 18px;
  color: var(--text-muted);
  cursor: pointer;
  transition:
    color 0.2s,
    transform 0.15s;
}
.icon:hover {
  color: var(--primary);
  transform: translateY(-1px);
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
}
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--border-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
}

/* ===== MAIN ===== */
.container {
  max-width: 1180px;
  margin: 32px auto;
  padding: 0 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
/* ===== DASHBOARD ===== */
.dashboard {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-soft);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  cursor: pointer;
  box-shadow: var(--shadow-soft);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.dashboard-header select {
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-soft);
  font-size: 0.95rem;
  outline: none;
}

.dashboard-header .deadline {
  font-size: 0.95rem;
  color: var(--text-muted);
}

.close-btn {
  align-self: flex-start;
  background: var(--danger);
  color: #fff;
  padding: 8px 14px;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #d73b1d;
}

/* ===== TABLE ===== */
.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

th, td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid var(--border-soft);
}

th {
  font-weight: 600;
  color: var(--text-main);
}

td {
  color: var(--text-main);
}

/* ===== STUDENT SELECT & FILES ===== */
.student-select select {
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-soft);
  font-size: 0.95rem;
  outline: none;
}

.student-files {
  display: flex;
  gap: 12px;
}

.student-files a {
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  padding: 6px 12px;
  border-radius: var(--radius-md);
  color: var(--primary);
  font-weight: 500;
  transition: background 0.2s, border-color 0.2s;
}

.student-files a:hover {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
  color: #fff;
}

/* ===== COMMENT BOX & RATE BUTTON ===== */
.comment-box {
  width: 100%;
  min-height: 100px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-soft);
  padding: 10px 12px;
  font-size: 0.95rem;
  resize: vertical;
  outline: none;
}

.comment-box:focus {
  border-color: var(--primary);
}

.rate-btn {
  align-self: flex-end;
  background: var(--primary);
  color: #fff;
  padding: 10px 18px;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.rate-btn:hover {
  background: var(--primary-hover);
}

/* ===== ADAPTIVE ===== */
@media (max-width: 1024px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 700px) {
  .container {
    padding: 0 16px;
  }

  .student-files {
    flex-wrap: wrap;
  }

  .dashboard-header {
    gap: 8px;
  }
}

</style>