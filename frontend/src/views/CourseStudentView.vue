
<template>
  <div class="course-student-page">
    <!-- Header -->
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

    <!-- Main Content -->
    <main class="container">
      <!-- Profile Block -->
      <div class="profile-block">
        <div class="profile-image-area" @click="triggerProfilePhotoUpload">
          <img id="profileImg" :src="profileImage" alt="Фото" class="profile-image">
          <div class="profile-upload-overlay">
            <i class="fas fa-camera"></i>
            <span>Изменить фото</span>
          </div>
        </div>
        <input id="profilePhoto" ref="profilePhotoInput" type="file" accept="image/*" style="display:none;"
          @change="handleProfilePhotoUpload">

        <div class="course-info">
          <div class="author-label">Автор курса</div>
          <div class="course-description">
            {{ courseTitle }}
          </div>
          <div class="teacher-info">
            <input class="input-editable" v-model="teacherName" :readonly="!editingTeacherName"
              @dblclick="editingTeacherName = true" @blur="saveTeacherName" @keyup.enter="saveTeacherName">
            <button v-if="editingTeacherName" class="save-btn" @click="saveTeacherName">
              <i class="fas fa-check"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Course Sections -->
      <div class="sections">
        <div v-for="(section, index) in sections" :key="section.id" class="section-block">
          <div class="section-header">
            <h3 class="section-title">Раздел {{ index + 1 }}: {{ section.title }}</h3>
            <div v-if="section.progress" class="section-progress">
              <div class="progress-bar-container">
                <div class="progress-bar-fill" :style="{ width: section.progress + '%' }"></div>
              </div>
              <span class="progress-text">{{ section.progress }}%</span>
            </div>
          </div>
          <ul class="section-list">
            <li v-for="material in section.materials" :key="material.id" 
                class="material-item"
                @click="openMaterial(material)">
              <div class="material-info">
                <i class="fas material-icon" :class="getMaterialIcon(material.type)"></i>
                <span class="material-title">{{ material.title }}</span>
                <span v-if="material.type === 'assignment'" class="material-status">
                  <i class="fas status-icon" :class="material.completed ? 'fa-check-circle' : 'fa-clock'"></i>
                  {{ material.completed ? 'Сдано' : 'Не сдано' }}
                </span>
              </div>
              <div v-if="material.deadline" class="deadline-info">
                <i class="fas fa-calendar-alt"></i>
                <span class="deadline-date" :class="{ 'urgent': isUrgent(material.deadline) }">
                  {{ formatDate(material.deadline) }}
                </span>
              </div>
            </li>
          </ul>
          <button class="expand-materials-btn" @click="toggleSection(section.id)">
            <i class="fas" :class="section.expanded ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
            {{ section.expanded ? 'Скрыть' : 'Показать все материалы' }}
            <span class="materials-count">({{ section.materials.length }})</span>
          </button>
        </div>
      </div>

      <!-- Dashboard -->
      <div class="dashboard">
        <div class="dashboard-tabs">
          <div class="dashboard-tab" 
               :class="{ active: activeTab === 'today' }" 
               @click="switchDashboard('today')">
            Сегодняшние задания
          </div>
          <div class="dashboard-tab" 
               :class="{ active: activeTab === 'recent' }" 
               @click="switchDashboard('recent')">
            Последние
          </div>
          <div class="dashboard-tab" 
               :class="{ active: activeTab === 'future' }" 
               @click="switchDashboard('future')">
            Будущие
          </div>
        </div>

        <div class="dashboard-content">
          <!-- Today Homeworks -->
          <div v-if="activeTab === 'today'" class="dashboard-list">
            <div v-for="assignment in todayAssignments" :key="assignment.id" 
                 class="dashboard-item"
                 @mouseover="hoverToday = assignment.id" 
                 @mouseleave="hoverToday = null"
                 :class="{ 'hovered': hoverToday === assignment.id }">
              <span class="dashboard-bar" :style="{ backgroundColor: assignment.color }"></span>

              <div class="dashboard-text">
                <strong>{{ assignment.task }}</strong>
                <span class="subject">({{ assignment.subject }})</span>
                <div v-if="assignment.description" class="assignment-description">
                  {{ assignment.description }}
                </div>
              </div>

              <span class="dashboard-status" :class="assignment.status">
                {{ getStatusText(assignment.status) }}
              </span>

              <div class="dashboard-icons">
                <button class="dashboard-icon-btn" @click="viewAssignment(assignment.id)" title="Просмотреть">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="dashboard-icon-btn" @click="editAssignment(assignment.id)" title="Редактировать">
                  <i class="fas fa-pen"></i>
                </button>
                <button v-if="!assignment.completed" class="dashboard-icon-btn submit-btn" 
                        @click="submitAssignment(assignment.id)" title="Сдать задание">
                  <i class="fas fa-upload"></i>
                </button>
                <button v-if="assignment.canDelete" class="dashboard-icon-btn delete-btn" 
                        @click="deleteAssignment(assignment.id)" title="Удалить">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Recent Assignments -->
          <div v-if="activeTab === 'recent'" class="dashboard-list">
            <div v-for="assignment in recentAssignments" :key="assignment.id" 
                 class="dashboard-item"
                 @mouseover="hoverRecent = assignment.id" 
                 @mouseleave="hoverRecent = null"
                 :class="{ 'hovered': hoverRecent === assignment.id }">
              <span class="dashboard-bar" :style="{ backgroundColor: assignment.color }"></span>

              <div class="dashboard-text">
                <strong>{{ assignment.task }}</strong>
                <span class="subject">({{ assignment.subject }})</span>
                <div class="assignment-date">
                  <i class="fas fa-calendar"></i>
                  Сдано: {{ formatDate(assignment.submittedAt) }}
                  <span v-if="assignment.grade" class="assignment-grade">
                    <i class="fas fa-star"></i> Оценка: {{ assignment.grade }}
                  </span>
                </div>
              </div>

              <span class="dashboard-status graded">
                {{ getStatusText(assignment.status) }}
              </span>

              <div class="dashboard-icons">
                <button class="dashboard-icon-btn" @click="viewFeedback(assignment.id)" title="Посмотреть отзыв">
                  <i class="fas fa-comment"></i>
                </button>
                <button class="dashboard-icon-btn" @click="reworkAssignment(assignment.id)" title="Доработать">
                  <i class="fas fa-redo"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Future Assignments -->
          <div v-if="activeTab === 'future'" class="dashboard-list">
            <div v-for="assignment in futureAssignments" :key="assignment.id" 
                 class="dashboard-item"
                 @mouseover="hoverFuture = assignment.id" 
                 @mouseleave="hoverFuture = null"
                 :class="{ 'hovered': hoverFuture === assignment.id }">
              <span class="dashboard-bar" :style="{ backgroundColor: assignment.color }"></span>

              <div class="dashboard-text">
                <strong>{{ assignment.task }}</strong>
                <span class="subject">({{ assignment.subject }})</span>
                <div class="assignment-deadline">
                  <i class="fas fa-clock"></i>
                  Срок сдачи: {{ formatDate(assignment.deadline) }}
                  <span v-if="isUrgent(assignment.deadline)" class="urgent-badge">
                    <i class="fas fa-exclamation-triangle"></i> Срочно!
                  </span>
                </div>
              </div>

              <span class="dashboard-status pending">
                {{ getStatusText(assignment.status) }}
              </span>

              <div class="dashboard-icons">
                <button class="dashboard-icon-btn start-btn" @click="startAssignment(assignment.id)" title="Начать выполнение">
                  <i class="fas fa-play"></i>
                </button>
                <button class="dashboard-icon-btn" @click="addToCalendar(assignment.id)" title="Добавить в календарь">
                  <i class="fas fa-calendar-plus"></i>
                </button>
                <button class="dashboard-icon-btn" @click="setReminder(assignment.id)" title="Установить напоминание">
                  <i class="fas fa-bell"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="getActiveAssignments.length === 0" class="empty-dashboard">
         ```vue
            <div class="empty-icon">
              <i class="fas" :class="getEmptyIcon()"></i>
            </div>
            <h3>{{ getEmptyTitle() }}</h3>
            <p>{{ getEmptyDescription() }}</p>
            <button v-if="activeTab === 'today'" class="action-btn" @click="findAssignments">
              <i class="fas fa-search"></i> Найти задания
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- File Upload Modal -->
    <div v-if="showFileUploadModal" class="modal-overlay" @click="closeFileUploadModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-upload"></i> Сдать задание
          </h3>
          <button class="close-btn" @click="closeFileUploadModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="file-upload-area" @dragover.prevent @drop="handleFileDrop">
            <i class="fas fa-cloud-upload-alt"></i>
            <p>Перетащите файлы сюда или</p>
            <button class="browse-btn" @click="triggerFileInput">
              Выберите файлы
            </button>
            <input type="file" 
                   ref="fileInput" 
                   multiple 
                   style="display: none" 
                   @change="handleFileInputChange">
            <p class="file-hint">
              Максимальный размер файла: 50MB
            </p>
          </div>
          
          <div v-if="selectedFiles.length > 0" class="file-list">
            <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
              <i class="fas fa-file"></i>
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">
                {{ formatFileSize(file.size) }}
              </span>
              <button class="remove-file-btn" @click="removeFile(index)">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div class="upload-comment">
            <label for="comment">
              Комментарий (опционально):
            </label>
            <textarea id="comment" 
                      v-model="uploadComment" 
                      placeholder="Добавьте комментарий к работе..."
                      rows="3"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel" @click="closeFileUploadModal">
            Отмена
          </button>
          <button class="modal-btn upload" @click="submitFiles" :disabled="selectedFiles.length === 0">
            <i class="fas fa-upload"></i> Сдать работу
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

// Router and Route
const router = useRouter();
const route = useRoute();

// Store
const authStore = useAuthStore();

// Refs
const profilePhotoInput = ref(null);
const fileInput = ref(null);
const profileImage = ref('https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_user_personalization&w=740&q=80');
const teacherName = ref('Фамилия Имя Отчество');
const editingTeacherName = ref(false);
const unreadNotifications = ref(5);
const activeTab = ref('today');
const showFileUploadModal = ref(false);
const showSuccessNotification = ref(false);
const successMessage = ref('');
const selectedFiles = ref([]);
const uploadComment = ref('');
const currentAssignmentId = ref(null);


const courseTitle = ref('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...');


const sections = ref([
  {
    id: 1,
    title: 'Введение в программирование',
    progress: 75,
    hasNewMaterials: true,
    expanded: false,
    materials: [
      { id: 1, type: 'lecture', title: 'Что такое программирование', completed: true, duration: '30 мин' },
      { id: 2, type: 'video', title: 'Первая программа на Python', completed: true, duration: '45 мин' },
      { id: 3, type: 'assignment', title: 'Установка среды разработки', completed: true, deadline: '2024-06-10' },
      { id: 4, type: 'quiz', title: 'Основы программирования', completed: true }
    ]
  },
  {
    id: 2,
    title: 'Работа с переменными',
    progress: 50,
    hasNewMaterials: false,
    expanded: false,
    materials: [
      { id: 5, type: 'lecture', title: 'Типы данных', completed: true, duration: '40 мин' },
      { id: 6, type: 'video', title: 'Операторы и выражения', completed: true, duration: '35 мин' },
      { id: 7, type: 'assignment', title: 'Практика с переменными', completed: false, deadline: '2024-06-20' }
    ]
  },
  {
    id: 3,
    title: 'Функции и модули',
    progress: 25,
    hasNewMaterials: true,
    expanded: false,
    materials: [
      { id: 8, type: 'video', title: 'Создание функций', completed: false, duration: '45 мин' },
      { id: 9, type: 'assignment', title: 'Создание модуля', completed: false, deadline: '2024-06-25' },
      { id: 10, type: 'code', title: 'Практика: функции', completed: false, completed: false, deadline: '2024-06-20' }
    ]
  }
]);

// Assignments data
const todayAssignments = ref([
  {
    id: 1,
    task: 'Book p. 77–85, read & complete tasks 1–6 on p. 85',
    subject: 'Physics',
    description: 'Прочитать раздел и выполнить задания',
    status: 'done',
    color: '#00e0fc',
    completed: true,
    canDelete: false,
    deadline: '2024-06-14'
  },
  {
    id: 2,
    task: 'Workbook p. 17, tasks 1–6',
    subject: 'Mathematics',
    description: 'Решить задачи из рабочей тетради',
    status: 'inprocess',
    color: '#19e8cd',
    completed: false,
    canDelete: true,
    deadline: '2024-06-14'
  },
  {
    id: 3,
    task: 'Learn paragraph p.99, Exercise 1,2,3',
    subject: 'Chemistry',
    description: 'Изучить параграф и выполнить упражнения',
    status: 'done',
    color: '#35d8ff',
    completed: true,
    canDelete: false,
    deadline: '2024-06-14'
  },
  {
    id: 4,
    task: 'Write essay 1000 words: "WW2 results"',
    subject: 'History',
    description: 'Написать эссе на 1000 слов',
    status: 'inprocess',
    color: '#865ef9',
    completed: false,
    canDelete: true,
    deadline: '2024-06-15'
  },
  {
    id: 5,
    task: 'Internal conflicts in Philip Larkin poems, read p 380–515',
    subject: 'English Language',
    description: 'Анализ поэзии Филипа Ларкина',
    status: 'inprocess',
    color: '#7e6df3',
    completed: false,
    canDelete: true,
    deadline: '2024-06-15'
  }
]);

const recentAssignments = ref([
  {
    id: 6,
    task: 'Data structures implementation',
    subject: 'Computer Science',
    status: 'graded',
    color: '#ff6b6b',
    submittedAt: '2024-06-12',
    grade: '85/100',
    feedback: 'Отличная работа!'
  },
  {
    id: 7,
    task: 'Database design project',
    subject: 'Databases',
    status: 'graded',
    color: '#4ecdc4',
    submittedAt: '2024-06-10',
    grade: '92/100',
    feedback: 'Хорошая структура базы данных'
  },
  {
    id: 8,
    task: 'Algorithms analysis',
    subject: 'Algorithms',
    status: 'graded',
    color: '#45b7d1',
    submittedAt: '2024-06-08',
    grade: '78/100',
    feedback: 'Требуется улучшить сложность алгоритмов'
  }
]);

const futureAssignments = ref([
  {
    id: 9,
    task: 'Final project submission',
    subject: 'Software Engineering',
    status: 'pending',
    color: '#96ceb4',
    deadline: '2024-06-30',
    important: true
  },
  {
    id: 10,
    task: 'Machine learning paper review',
    subject: 'AI',
    status: 'pending',
    color: '#ffd166',
    deadline: '2024-06-28'
  },
  {
    id: 11,
    task: 'Network security presentation',
    subject: 'Cybersecurity',
    status: 'pending',
    color: '#118ab2',
    deadline: '2024-06-25'
  },
  {
    id: 12,
    task: 'Mobile app prototype',
    subject: 'Mobile Development',
    status: 'pending',
    color: '#ef476f',
    deadline: '2024-06-22'
  }
]);

// Computed properties
const userName = computed(() => {
  return authStore.user?.name || 'Иван Иванов';
});

const getActiveAssignments = computed(() => {
  switch (activeTab.value) {
    case 'today': return todayAssignments.value;
    case 'recent': return recentAssignments.value;
    case 'future': return futureAssignments.value;
    default: return [];
  }
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

const triggerProfilePhotoUpload = () => {
  profilePhotoInput.value.click();
};

const handleProfilePhotoUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert('Изображение слишком большое. Максимальный размер: 5MB');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите файл изображения');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      profileImage.value = e.target.result;
      showSuccess('Фото профиля успешно обновлено');
    };
    reader.readAsDataURL(file);
  }
};

const saveTeacherName = () => {
  editingTeacherName.value = false;
  console.log('Имя преподавателя сохранено:', teacherName.value);
};

const toggleSection = (sectionId) => {
  const section = sections.value.find(s => s.id === sectionId);
  if (section) {
    section.expanded = !section.expanded;
  }
};

const openMaterial = (material) => {
  console.log('Открыть материал:', material);
  
  switch (material.type) {
    case 'lecture':
    case 'video':
      // Открыть лекцию или видео
      window.open(material.url || '#', '_blank');
      break;
    case 'assignment':
      // Открыть задание для выполнения
      openAssignment(material);
      break;
    case 'quiz':
      // Начать тест
      startQuiz(material);
      break;
    default:
      // Открыть общий материал
      alert(`Открыть материал: ${material.title}`);
  }
};

const getMaterialIcon = (type) => {
  const icons = {
    'lecture': 'fa-file-alt',
    'video': 'fa-video',
    'assignment': 'fa-tasks',
    'quiz': 'fa-question-circle',
    'code': 'fa-code',
    'practice': 'fa-dumbbell'
  };
  return icons[type] || 'fa-file';
};

const switchDashboard = (tab) => {
  activeTab.value = tab;
};

const getStatusText = (status) => {
  const statusMap = {
    'done': 'Сделано',
    'inprocess': 'В процессе',
    'pending': 'Ожидает',
    'graded': 'Оценено',
    'overdue': 'Просрочено'
  };
  return statusMap[status] || status;
};

const viewAssignment = (assignmentId) => {
  console.log('Просмотреть задание:', assignmentId);
  const assignment = todayAssignments.value.find(a => a.id === assignmentId);
  if (assignment) {
    alert(`Просмотр задания: ${assignment.task}`);
  }
};

const editAssignment = (assignmentId) => {
  console.log('Редактировать задание:', assignmentId);
  // Открыть редактор задания
};

const submitAssignment = (assignmentId) => {
  console.log('Сдать задание:', assignmentId);
  currentAssignmentId.value = assignmentId;
  showFileUploadModal.value = true;
};

const deleteAssignment = (assignmentId) => {
  if (confirm('Вы уверены, что хотите удалить это задание?')) {
    const index = todayAssignments.value.findIndex(a => a.id === assignmentId);
    if (index !== -1) {
      todayAssignments.value.splice(index, 1);
      showSuccess('Задание удалено');
    }
  }
};

const viewFeedback = (assignmentId) => {
  const assignment = recentAssignments.value.find(a => a.id === assignmentId);
  if (assignment) {
    alert(`Отзыв по заданию:\n\n${assignment.task}\n\nОценка: ${assignment.grade}\n\n${assignment.feedback}`);
  }
};

const reworkAssignment = (assignmentId) => {
  console.log('Доработать задание:', assignmentId);
  // Логика для повторной сдачи задания
};

const startAssignment = (assignmentId) => {
  console.log('Начать выполнение задания:', assignmentId);
  // Открыть задание для выполнения
};

const addToCalendar = (assignmentId) => {
  console.log('Добавить в календарь:', assignmentId);
  showSuccess('Добавлено в календарь');
};

const setReminder = (assignmentId) => {
  console.log('Установить напоминание:', assignmentId);
  showSuccess('Напоминание установлено');
};

const closeFileUploadModal = () => {
  showFileUploadModal.value = false;
  selectedFiles.value = [];
  uploadComment.value = '';
  currentAssignmentId.value = null;
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileInputChange = (event) => {
  const files = Array.from(event.target.files);
  handleFiles(files);
};

const handleFileDrop = (event) => {
  event.preventDefault();
  const files = Array.from(event.dataTransfer.files);
  handleFiles(files);
};

const handleFiles = (files) => {
  // Проверка размера файлов
  const maxSize = 50 * 1024 * 1024; // 50MB
  const validFiles = files.filter(file => {
    if (file.size > maxSize) {
      alert(`Файл "${file.name}" слишком большой. Максимальный размер: 50MB`);
      return false;
    }
    return true;
  });
  
  selectedFiles.value.push(...validFiles);
};

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const submitFiles = () => {
  if (selectedFiles.value.length === 0) return;
  
  console.log('Сдать файлы для задания:', currentAssignmentId.value);
  console.log('Файлы:', selectedFiles.value);
  console.log('Комментарий:', uploadComment.value);
  
  // Здесь должен быть API вызов для загрузки файлов
  // Например: await api.assignments.submit(currentAssignmentId.value, selectedFiles.value, uploadComment.value);
  
  // Обновляем статус задания
  if (currentAssignmentId.value) {
    const assignment = todayAssignments.value.find(a => a.id === currentAssignmentId.value);
    if (assignment) {
      assignment.status = 'done';
      assignment.completed = true;
    }
  }
  
  showSuccess('Задание успешно сдано');
  closeFileUploadModal();
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const isUrgent = (dateString) => {
  const now = new Date();
  const deadline = new Date(dateString);
  const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  return diffDays <= 3;
};

const getEmptyIcon = () => {
  switch (activeTab.value) {
    case 'today': return 'fa-check-circle';
    case 'recent': return 'fa-history';
    case 'future': return 'fa-calendar-plus';
    default: return 'fa-inbox';
  }
};

const getEmptyTitle = () => {
  switch (activeTab.value) {
    case 'today': return 'Отличная работа!';
    case 'recent': return 'Нет недавних заданий';
    case 'future': return 'Пока нет будущих заданий';
    default: return 'Нет данных';
  }
};

const getEmptyDescription = () => {
  switch (activeTab.value) {
    case 'today': return 'Все задания на сегодня выполнены. Так держать!';
    case 'recent': return 'У вас нет недавно выполненных или проверенных заданий.';
    case 'future': return 'Будущие задания появятся здесь, когда преподаватель их добавит.';
    default: return '';
  }
};

const findAssignments = () => {
  console.log('Поиск заданий');
  // Логика поиска заданий
};

const showSuccess = (message) => {
  successMessage.value = message;
  showSuccessNotification.value = true;
  
  // Автоматически скрыть уведомление через 5 секунд
  setTimeout(() => {
    showSuccessNotification.value = false;
  }, 5000);
};

const closeSuccessNotification = () => {
  showSuccessNotification.value = false;
};

// Lifecycle hooks
onMounted(() => {
  console.log('CourseStudentView загружен');
  // Здесь можно загрузить данные курса по ID из route.params.id
});
</script>

<style scoped>
/* Base styles */
.course-student-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #FFFFFF 100%);
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
/* Profile block */
.profile-block {
  display: flex;
  align-items: center;
  gap: 20px;
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
}

.profile-image-area {
  position: relative;
  cursor: pointer;
  width: 60px; 
  height: 60px; 
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 10px; /* Уменьшен текст */
}

.profile-image-area:hover .profile-upload-overlay {
  opacity: 1;
}

.course-info {
  flex: 1;
}

.author-label {
  color: #7b7c85;
  font-size: 14px;
  margin-bottom: 4px;
}

.course-description {
  font-weight: bold;
  font-size: 23px;
  color: #273357;
  margin-bottom: 8px;
}

.teacher-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-editable {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  color: #273357;
  background: #fafafc;
  transition: all 0.2s;
  flex: 1;
  max-width: 300px;
}

.input-editable:focus {
  outline: none;
  border-color: #6940ee;
  background: white;
}

.input-editable:read-only {
  border-color: transparent;
  background: transparent;
  cursor: pointer;
}

.save-btn {
  background: #6940ee;
  color: white;
  border: none;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn:hover {
  background: #4c2cb8;
}

/* Sections styles */
.sections {
  margin-bottom: 30px;
}

.section-block {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-weight: 600;
  font-size: 18px;
  color: #273357;
  margin: 0;
}

.section-progress {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.progress-bar-container {
  width: 100px;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: #6940ee;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #7b7c85;
  min-width: 40px;
}

.section-list {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.material-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s;
}

.material-item:hover {
  background: #fafafc;
  padding-left: 10px;
  padding-right: 10px;
  margin: 0 -10px;
  border-radius: 8px;
}

.material-item:last-child {
  border-bottom: none;
}

.material-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.material-icon {
  color: #6940ee;
  font-size: 16px;
  min-width: 20px;
}

.material-title {
  flex: 1;
  color: #273357;
}

.material-status {
  font-size: 12px;
  color: #7b7c85;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-icon {
  font-size: 14px;
}

.status-icon.fa-check-circle {
  color: #14c856;
}

.status-icon.fa-clock {
  color: #ffb400;
}

.deadline-info {
  margin-top: 4px;
  font-size: 12px;
  color: #7b7c85;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-left: 32px;
}

.deadline-date.urgent {
  color: #ff4625;
  font-weight: 500;
}

.expand-materials-btn {
  background: none;
  border: none;
  color: #6940ee;
  cursor: pointer;
  padding: 12px 0 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.expand-materials-btn:hover {
  color: #4c2cb8;
}

.materials-count {
  color: #7b7c85;
  font-size: 12px;
}

/* Dashboard styles */
.dashboard {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.dashboard-tabs {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 12px;
}

.dashboard-tab {
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 600;
  color: #7b7c85;
  border-radius: 10px;
  transition: all 0.2s;
  border: none;
  background: transparent;
  font-size: 14px;
}

.dashboard-tab:hover {
  background: rgba(105, 64, 238, 0.1);
  color: #6940ee;
}

.dashboard-tab.active {
  background: #6940ee;
  color: #fff;
}

.dashboard-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dashboard-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 16px;
  background: #fafafc;
  margin-bottom: 12px;
  transition: all 0.2s;
}

.dashboard-item.hovered {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.dashboard-bar {
  width: 6px;
  height: 40px;
  border-radius: 3px;
  margin-right: 16px;
  flex-shrink: 0;
}

.dashboard-text {
  flex: 1;
}

.dashboard-text strong {
  color: #273357;
  font-size: 15px;
  display: block;
  margin-bottom: 4px;
}

.subject {
  color: #7b7c85;
  font-size: 13px;
}

.assignment-description,
.assignment-date,
.assignment-deadline {
  margin-top: 6px;
  color: #7b7c85;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.assignment-grade {
  color: #14c856;
  margin-left: 10px;
}

.urgent-badge {
  color: #ff4625;
  margin-left: 10px;
  font-weight: 500;
}

.dashboard-status {
  margin: 0 20px;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 12px;
  min-width: 80px;
  text-align: center;
  flex-shrink: 0;
}

.dashboard-status.pending {
  background: #fff4e5;
  color: #f5a623;
}

.dashboard-status.done {
  background: #e8f7ed;
  color: #14c856;
}

.dashboard-status.graded {
  background: #e8f7ed;
  color: #14c856;
}

.dashboard-icons {
  display: flex;
  gap: 8px;
}

.dashboard-icon-btn {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #7b7c85;
  transition: all 0.2s;
  flex-shrink: 0;
}

.dashboard-icon-btn:hover {
  border-color: #6940ee;
  color: #6940ee;
}

.submit-btn {
  background: #6940ee !important;
  border: none !important;
  color: white !important;
}

.submit-btn:hover {
  background: #4c2cb8 !important;
  color: white !important;
}

.delete-btn {
  background: #ff4625 !important;
  border: none !important;
  color: white !important;
}

.delete-btn:hover {
  background: #e03c20 !important;
  color: white !important;
}

.start-btn {
  background: #6940ee !important;
  border: none !important;
  color: white !important;
}

.start-btn:hover {
  background: #4c2cb8 !important;
  color: white !important;
}

/* Empty dashboard state */
.empty-dashboard {
  text-align: center;
  padding: 40px 20px;
  color: #7b7c85;
}

.empty-icon {
  font-size: 48px;
  color: #e0e0e0;
  margin-bottom: 20px;
}

.empty-dashboard h3 {
  color: #273357;
  margin-bottom: 10px;
  font-size: 18px;
}

.empty-dashboard p {
  margin-bottom: 20px;
  font-size: 14px;
}

.action-btn {
  background: #6940ee;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.action-btn:hover {
  background: #4c2cb8;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 6px;
  animation: modalAppear 0.3s ease;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #273357;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-header .fas {
  color: #6940ee;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #7b7c85;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f0f0f0;
  color: #ff4625;
}

.modal-body {
  padding: 24px;
}

.file-upload-area {
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.file-upload-area:hover {
  border-color: #6940ee;
}

.file-upload-area .fa-cloud-upload-alt {
  font-size: 48px;
  color: #7b7c85;
  margin-bottom: 16px;
}

.file-upload-area p {
  margin: 8px 0;
  color: #7b7c85;
}

.browse-btn {
  background: #6940ee;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  margin-top: 10px;
}

.browse-btn:hover {
  background: #4c2cb8;
}

.file-hint {
  margin-top: 12px;
  font-size: 12px;
  color: #a0a0a0;
}

.file-list {
  margin-top: 20px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #fafafc;
  border-radius: 8px;
  margin-bottom: 8px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.file-item .fa-file {
  color: #6940ee;
  margin-right: 12px;
  font-size: 16px;
}

.file-name {
  flex: 1;
  color: #273357;
  font-size: 14px;
  word-break: break-all;
}

.file-size {
  color: #7b7c85;
  font-size: 12px;
  margin-right: 12px;
}

.remove-file-btn {
  background: none;
  border: none;
  color: #ff4625;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.remove-file-btn:hover {
  background: rgba(255, 70, 37, 0.1);
}

.upload-comment {
  margin-top: 20px;
}

.upload-comment label {
  display: block;
  margin-bottom: 8px;
  color: #273357;
  font-weight: 500;
  font-size: 14px;
}

.upload-comment textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  color: #273357;
  font-size: 14px;
  transition: all 0.2s;
  min-height: 80px;
}

.upload-comment textarea:focus {
  outline: none;
  border-color: #6940ee;
  box-shadow: 0 0 0 2px rgba(105, 64, 238, 0.1);
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-btn {
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  border: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-btn.cancel {
  background: #f0f0f0;
  color: #7b7c85;
}

.modal-btn.cancel:hover {
  background: #e0e0e0;
}

.modal-btn.upload {
  background: #6940ee;
  color: white;
}

.modal-btn.upload:hover:not(:disabled) {
  background: #4c2cb8;
}

.modal-btn.upload:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Success notification */
.success-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #14c856;
  color: white;
  padding: 16px 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 20px rgba(20, 200, 86, 0.3);
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.success-notification .fa-check-circle {
  font-size: 20px;
}

.success-notification span {
  font-weight: 500;
  font-size: 14px;
}

.close-notification {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0 0 0 12px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-notification:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
  }
  
  .container {
    padding: 0 16px;
  }
  
  .profile-block {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .teacher-info {
    justify-content: center;
  }
  
  .input-editable {
    max-width: 100%;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .dashboard-tabs {
    flex-direction: column;
    gap: 8px;
  }
  
  .dashboard-item {
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .dashboard-status {
    margin: 0;
    order: 3;
  }
  
  .dashboard-icons {
    order: 4;
    margin-left: auto;
  }
  
  .modal-content {
    width: 95%;
    margin: 10px;
  }
}

@media (max-width: 480px) {
  .header-right {
    gap: 12px;
  }
  
  .user-info span {
    display: none;
  }
  
  .profile-block {
    padding: 16px;
  }
  
  .course-description {
    font-size: 20px;
  }
  
  .dashboard {
    padding: 16px;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .modal-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
