
<template>
  <div class="courses-teacher-page">
    <!-- Header -->
    <header>
      <div class="header-container">
        <div class="header-left">
          <div class="logo">
            <router-link to="/teacher/home">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Vstu_logo.svg/640px-Vstu_logo.svg.png" 
                   alt="ВГТУ" 
                   width="24" 
                   height="34">
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
            <router-link to="/profile" class="user-avatar">
              <i class="fas fa-user"></i>
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="container">
      <!-- Course Title -->
      <h1 class="course-title">{{ course.title }}</h1>

      <!-- Course Controls -->
      <div class="controls">
        <button class="secondary-btn" @click="addSection">
          <i class="fas fa-plus"></i> Добавить раздел
        </button>
        <button class="secondary-btn" @click="openEnrollmentSettings">
          <i class="fas fa-user-plus"></i> Настройка зачисления на курс
        </button>
        <button class="secondary-btn" @click="navigateToGrading">
          <i class="fas fa-check-circle"></i> Оценка работ
        </button>
        <button class="main-btn delete-btn" @click="confirmDeleteCourse">
          <i class="fas fa-trash"></i> Удалить курс
        </button>
      </div>

      <!-- Course Sections -->
      <div class="sections">
        <div v-for="(section, index) in sections" :key="section.id" class="section-card">
          <div class="section-header">
            <div class="section-title">
              <span>Раздел {{ index + 1 }}: {{ section.title }}</span>
              <div class="section-badge" v-if="section.hasGradingTasks">
                <i class="fas fa-exclamation-circle"></i> Ожидает проверки
              </div>
            </div>
            <div class="section-actions">
              <button class="action-btn edit-btn" @click="editSection(section)">
                <i class="fas fa-edit"></i> Редактировать
              </button>
              <button class="action-btn delete-btn" @click="deleteSection(section.id)">
                <i class="fas fa-trash"></i> Удалить
              </button>
            </div>
          </div>
          <div class="section-content">
            <ul>
              <li v-for="material in section.materials" :key="material.id" 
                  class="material-item" 
                  @click="openMaterial(material)">
                <i class="fas" 
                   :class="getMaterialIcon(material.type)"></i>
                <span>{{ material.title }}</span>
                <div v-if="material.type === 'assignment'" class="assignment-actions">
                  <router-link to="/teacher/grade-works" class="check-link">
                    <i class="fas fa-check-circle"></i> Проверить
                  </router-link>
                  <span class="submissions-count">({{ material.submissionsCount }})</span>
                </div>
              </li>
            </ul>
          </div>
          <div class="section-footer">
            <button class="add-material-btn" @click="addMaterialToSection(section.id)">
              <i class="fas fa-plus-circle"></i> Добавить материал
            </button>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="sections.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-folder-open"></i>
          </div>
          <h3>В этом курсе пока нет разделов</h3>
          <p>Создайте первый раздел, чтобы добавить материалы и задания для студентов</p>
          <button class="empty-action-btn" @click="addSection">
            <i class="fas fa-plus"></i> Создать раздел
          </button>
        </div>
      </div>

      <!-- Dashboard -->
      <div class="dashboard-row">
        <!-- Active Lessons Card -->
        <div class="dashboard-board lessons-board">
          <div class="board-header">
            <div class="board-title">
              <i class="fas fa-chart-line"></i> Активные уроки
            </div>
            <div class="board-desc">Среднее: {{ averageCompletion }}% завершенных уроков</div>
          </div>
          <ul class="lessons-list">
            <li v-for="lesson in activeLessons" :key="lesson.id" 
                @click="openLesson(lesson.id)">
              <div class="lesson-info">
                <span class="lesson-icon" :class="lesson.iconClass"></span>
                <span class="lesson-name">{{ lesson.name }}</span>
              </div>
              <div class="lesson-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: lesson.progress + '%' }"></div>
                </div>
                <span class="progress-text">{{ lesson.progress }}%</span>
              </div>
            </li>
          </ul>
        </div>

        <!-- Members Statistics Card -->
        <div class="dashboard-board members-board">
          <div class="board-header">
            <div class="board-title">
              <i class="fas fa-users"></i> Статистика участников
            </div>
            <div class="board-desc">Всего участников: {{ members.length }}</div>
          </div>
          <div class="members-table-container">
            <table class="members-table">
              <thead>
                <tr>
                  <th>Студент</th>
                  <th>Группа</th>
                  <th>Прогресс</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in members" :key="member.id">
                  <td class="member-info">
                    <div class="avatar mini" :style="{ backgroundColor: getAvatarColor(member.id) }">
                      {{ getInitials(member.name) }}
                    </div>
                    <div class="member-details">
                      <strong>{{ member.name }}</strong>
                      <span class="sub">{{ member.specialization }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="group-info">
                      <strong>{{ member.group }}</strong>
                      <span class="sub">{{ member.faculty }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="progress-cell">
                      <div class="progress-table">
                        <div class="progress-line" 
                             :style="{
                               width: member.progress + '%',
                               backgroundColor: getProgressColor(member.progress)
                             }"></div>
                        <span class="progress-text">{{ member.progress }}%</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="action-icon" @click="viewStudentProgress(member.id)" title="Просмотр прогресса">
                        <i class="fas fa-chart-bar"></i>
                      </button>
                      <button class="action-icon" @click="messageStudent(member.id)" title="Написать сообщение">
                        <i class="fas fa-envelope"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Add Section Modal -->
      <div v-if="showAddSectionModal" class="modal-overlay" @click="closeAddSectionModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3><i class="fas fa-plus-circle"></i> Добавить раздел</h3>
            <button class="close-btn" @click="closeAddSectionModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="sectionTitle">Название раздела:</label>
              <input id="sectionTitle" 
                     v-model="newSectionTitle" 
                     type="text" 
                     placeholder="Введите название раздела..."
                     class="modal-input"
                     @keyup.enter="saveNewSection">
            </div>
            <div class="form-group">
              <label for="sectionDescription">Описание (опционально):</label>
              <textarea id="sectionDescription" 
                        v-model="newSectionDescription" 
                        placeholder="Краткое описание раздела..."
                        class="modal-textarea"
                        rows="3"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="modal-btn cancel" @click="closeAddSectionModal">
              Отмена
            </button>
            <button class="modal-btn save" @click="saveNewSection" :disabled="!newSectionTitle.trim()">
              Сохранить
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteConfirm" class="modal-overlay" @click="closeDeleteConfirm">
        <div class="modal-content delete-confirm" @click.stop>
          <div class="modal-header">
            <h3><i class="fas fa-exclamation-triangle"></i> Подтверждение удаления</h3>
            <button class="close-btn" @click="closeDeleteConfirm">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="warning-icon">
              <i class="fas fa-trash"></i>
            </div>
            <p>Вы уверены, что хотите удалить курс <strong>"{{ course.title }}"</strong>?</p>
            <p class="warning-text">Это действие нельзя отменить. Все материалы, задания и оценки будут удалены.</p>
            <div class="confirm-input" v-if="requireConfirmationText">
              <p>Введите <strong>{{ course.title }}</strong> для подтверждения:</p>
              <input type="text" 
                     v-model="confirmationText" 
                     :placeholder="'Введите: ' + course.title"
                     class="confirm-text-input">
            </div>
          </div>
          <div class="modal-footer">
            <button class="modal-btn cancel" @click="closeDeleteConfirm">
              Отмена
            </button>
            <button class="modal-btn delete" 
                    @click="deleteCourse" 
                    :disabled="requireConfirmationText && confirmationText !== course.title">
              Удалить курс
            </button>
          </div>
        </div>
      </div>
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

// Reactive data
const unreadNotifications = ref(3);
const showAddSectionModal = ref(false);
const showDeleteConfirm = ref(false);
const requireConfirmationText = ref(true);
const confirmationText = ref('');
const newSectionTitle = ref('');
const newSectionDescription = ref('');

// Course data
const course = ref({
  id: route.params.id || 1,
  title: 'Введение в программирование на Python',
  description: 'Курс по основам программирования для начинающих',
  code: 'CS101',
  enrollmentType: 'open',
  totalStudents: 45,
  activeStudents: 38,
  createdAt: '2024-01-15'
});

// Sections data
const sections = ref([
  {
    id: 1,
    title: 'Основные конструкции',
    description: 'Переменные, типы данных, операторы',
    order: 2,
    materials: 3,
    hasGradingTasks: true
  },
  {
    id: 2,
    title: 'Основные конструкции',
    description: 'Переменные, типы данных, операторы',
    order: 2,
    materials: 2,
    hasGradingTasks: true
  },
  {
    id: 3,
    title: 'Функции и модули',
    description: 'Создание функций и работа с модулями',
    order: 3,
    materials: 1,
    hasGradingTasks: false
  }
]);

// Active lessons data
const activeLessons = ref([]);

// Members data
const members = ref([
  { 
    id: 1, 
    name: 'Иванов Иван', 
    group: 'ИС-101', 
    faculty: 'Информационные системы',
    specialization: 'Программирование',
    progress: 65,
    avatarColor: '#20d4ea'
  },
  { 
    id: 2, 
    name: 'Петров Петр', 
    group: 'ИС-102', 
    faculty: 'Информационные системы',
    specialization: 'Веб-разработка',
    progress: 78,
    avatarColor: '#ffd500'
  },
  { 
    id: 3, 
    name: 'Сидорова Анна', 
    group: 'ИС-101', 
    faculty: 'Информационные системы',
    specialization: 'Мобильная разработка',
    progress: 92,
    avatarColor: '#ea2089'
  },
  { 
    id: 4, 
    name: 'Кузнецов Алексей', 
    group: 'ИС-103', 
    faculty: 'Программная инженерия',
    specialization: 'Искусственный интеллект',
    progress: 45,
    avatarColor: '#20ea59'
  },
  { 
    id: 5, 
    name: 'Михайлова Елена', 
    group: 'ИС-102', 
    faculty: 'Информационные системы',
    specialization: 'Анализ данных',
    progress: 87,
    avatarColor: '#f14d34'
  }
]);

// Computed properties
const userName = computed(() => {
  return authStore.user?.name || 'Иван Иванов';
});

const averageCompletion = computed(() => {
  if (!activeLessons.value || activeLessons.value.length === 0) return 0; // проверка на null/undefined
  const sum = activeLessons.value.reduce((acc, lesson) => acc + lesson.progress, 0);
  return Math.round(sum / activeLessons.value.length);
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

const addSection = () => {
  newSectionTitle.value = '';
  newSectionDescription.value = '';
  showAddSectionModal.value = true;
};

const closeAddSectionModal = () => {
  showAddSectionModal.value = false;
};

const saveNewSection = () => {
  if (!newSectionTitle.value.trim()) return;
  
  const newSection = {
    id: sections.value.length + 1,
    title: newSectionTitle.value,
    description: newSectionDescription.value,
    order: sections.value.length + 1,
    materials: [],
    hasGradingTasks: false
  };
  
  sections.value.push(newSection);
  closeAddSectionModal();
  
  console.log('Раздел добавлен:', newSection);
};

const editSection = (section) => {
  console.log('Редактировать раздел:', section);
  const newTitle = prompt('Введите новое название раздела:', section.title);
  if (newTitle && newTitle.trim()) {
    section.title = newTitle.trim();
  }
};

const deleteSection = (sectionId) => {
  const confirmDelete = confirm('Вы уверены, что хотите удалить этот раздел? Все материалы будут удалены.');
  if (confirmDelete) {
    const index = sections.value.findIndex(s => s.id === sectionId);
    if (index !== -1) {
      sections.value.splice(index, 1);
      console.log('Раздел удален');
    }
  }
};

const addMaterialToSection = (sectionId) => {
  console.log('Добавить материал в раздел:', sectionId);
  //получаем доступ к массиву materials
  const section = sections.value.find(s => s.id === sectionId);
  if (!section) return;
  
  // Убедимся, что materials - массив
  if (!Array.isArray(section.materials)) {
    section.materials = [];
  }
  
  const materialType = prompt('Выберите тип материала (lecture/video/assignment/quiz/code):');
  const materialTitle = prompt('Введите название материала:');
  
  if (materialType && materialTitle) {
    const newMaterial = {
      id: Date.now(),
      type: materialType,
      title: materialTitle,
      submissionsCount: materialType === 'assignment' ? 0 : undefined,
      url: '#'
    };
    
    section.materials.push(newMaterial);
    console.log('Материал добавлен:', newMaterial);
  }
};

const openMaterial = (material) => {
  console.log('Открыть материал:', material);
};

const getMaterialIcon = (type) => {
  switch(type) {
    case 'lecture': return 'fa-file-alt';
    case 'video': return 'fa-video';
    case 'assignment': return 'fa-tasks';
    case 'quiz': return 'fa-question-circle';
    case 'code': return 'fa-code';
    default: return 'fa-file';
  }
};

const openEnrollmentSettings = () => {
  console.log('Открыть настройки зачисления');
  alert('Открыть настройки зачисления на курс');
};

const navigateToGrading = () => {
  router.push('/teacher/grade-works');
};

const confirmDeleteCourse = () => {
  confirmationText.value = '';
  showDeleteConfirm.value = true;
};

const closeDeleteConfirm = () => {
  showDeleteConfirm.value = false;
};

const deleteCourse = () => {
  if (requireConfirmationText.value && confirmationText.value !== course.value.title) {
    alert('Пожалуйста, введите точное название курса для подтверждения удаления');
    return;
  }
  
  console.log('Курс удален:', course.value.id);
  router.push('/teacher/home');
};

const openLesson = (lessonId) => {
  console.log('Открыть урок:', lessonId);
};

const getAvatarColor = (id) => {
  const colors = ['#20d4ea', '#ffd500', '#ea2089', '#20ea59', '#f14d34', '#007acc'];
  return colors[id % colors.length];
};

const getInitials = (name) => {
  return name.split(' ').map(word => word[0]).join('').toUpperCase();
};

const getProgressColor = (progress) => {
  if (progress >= 80) return '#14C856'; // green
  if (progress >= 60) return '#FFA500'; // orange
  return '#FF4625'; // red
};

const viewStudentProgress = (studentId) => {
  console.log('Просмотр прогресса студента:', studentId);
};

const messageStudent = (studentId) => {
  console.log('Написать сообщение студенту:', studentId);
};

// Lifecycle
onMounted(() => {
  console.log('CoursesTeacherView загружен, ID курса:', route.params.id);
  
  
  activeLessons.value = [
    { id: 1, title: 'Урок 1', progress: 85 },
    { id: 2, title: 'Урок 2', progress: 65 },
    { id: 3, title: 'Урок 3', progress: 45 }
  ];
});
</script>

<style scoped>

/* ===== BASE ===== */
:root {
    --primary: #6940EE;
    --primary-hover: #4C2CB8;
    --danger: #FF4625;
    --border-soft: #F5F5F5;
    --bg-main: #FAFAFC;
    --bg-card: #FFFFFF;
    --text-main: #1D1D1D;
    --text-muted: #6F6F7A;
    --radius-lg: 14px;
    --radius-md: 10px;
    --shadow-soft: 0 3px 12px rgba(0,0,0,0.08);
    --shadow-hover: 0 12px 26px rgba(0,0,0,0.1);
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
    font-family: 'Segoe UI', Arial, sans-serif;
    background: var(--bg-main);
    color: var(--text-main);
}
a { text-decoration: none; color: var(--primary); }

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
h1.course-title {
    text-align: center;
    font-size: 2em;
    margin: 0px 0 30px 0;
    font-weight: bold;
}

/* ===== CONTROLS ===== */
.controls {
    display: flex;
    justify-content: center;
    gap: 18px;
    margin-bottom: 30px;
    flex-wrap: wrap;
}
.controls button {
    border-radius: 14px;
    padding: 10px 24px;
    font-size: 1em;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.18s;
    border: none;
}
.controls .main-btn { background: var(--primary); color: #fff; }
.controls .main-btn:hover { background: var(--primary-hover); }
.controls .secondary-btn { background: #fff; color: var(--primary); border: 1px solid var(--primary); }
.controls .secondary-btn:hover { background: #f5f5ff; }
.controls .delete-btn { background: var(--danger); color: #fff; }

/* ===== SECTIONS ===== */
.sections { display: flex; flex-direction: column; gap: 16px; margin-bottom: 36px; }
.section-card {
    background: var(--bg-card);
    border: 1.5px solid var(--border-soft);
    border-radius: 14px;
    padding: 18px 23px;
    box-shadow: var(--shadow-soft);
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 1.2em;
    margin-bottom: 5px;
}
.section-header a {
    color: var(--primary);
    font-size: 0.98em;
    margin-left: 6px;
}
.section-header .delete { color: var(--danger); }
.section-card ul { padding-left: 20px; margin: 0; }
.section-card ul li { margin-bottom: 3px; font-size: 0.99em; }
.section-card ul .check { color: var(--primary); text-decoration: none; margin-left: 10px; font-weight: 500; }

/* ===== DASHBOARD ===== */
.dashboard-row { display: flex; flex-wrap: wrap; gap: 24px; margin-bottom: 90px; }
.dashboard-board {
    flex: 1 1 400px;
    background: var(--bg-card);
    padding: 25px 35px;
    border-radius: 16px;
    box-shadow: var(--shadow-soft);
    display: flex;
    flex-direction: column;
    text-decoration: none;
    color: inherit;
    transition: box-shadow 0.22s;
    cursor: pointer;
    min-width: 370px;
}
.dashboard-board:hover { box-shadow: var(--shadow-hover); }
.board-title { font-weight: 700; font-size: 1.15em; margin-bottom: 3px; }
.board-desc { font-size: 0.96em; color: var(--text-muted); margin-bottom: 19px; }

/* ===== LESSONS ===== */
.lessons-list { list-style: none; margin: 0; padding: 0; }
.lessons-list li { display: flex; align-items: center; margin-bottom: 7px; font-size: 1em; gap: 10px; }
.lesson-icon { width: 21px; height: 21px; border-radius: 4px; display: inline-block; margin-right: 7px; background: #e7e7e7; }
.laravel { background: #f14d34; }
.vue { background: #42b883; }
.bootstrap { background: #7952b3; }
.angular { background: #dd0031; }
.spring { background: #6db33f; }
.ts { background: #007acc; }
.progress-bar { width: 90px; height: 6px; border-radius: 3px; margin-left: 10px; background: #ececec; position: relative; overflow: hidden; }
.progress-bar::after { content: ''; display: block; height: 100%; border-radius: 3px; background: currentColor; }
.lessons-list li:nth-child(1) .progress-bar::after { width: 65%; color: #20d4ea; }
.lessons-list li:nth-child(2) .progress-bar::after { width: 87%; color: #ffd500; }
.lessons-list li:nth-child(3) .progress-bar::after { width: 44%; color: #ea2089; }
.lessons-list li:nth-child(4) .progress-bar::after { width: 70%; color: #20ea59; }
.lessons-list li:nth-child(5) .progress-bar::after { width: 50%; color: #f14d34; }
.lessons-list li:nth-child(6) .progress-bar::after { width: 82%; color: #007acc; }

/* ===== MEMBERS TABLE ===== */
.members-table { width: 100%; border-collapse: collapse; font-size: 0.99em; }
.members-table th { text-align: left; padding-bottom: 7px; font-weight: 600; color: #777; }
.members-table td { padding: 7px 4px; vertical-align: middle; }
.members-table .avatar.mini { width: 32px; height: 32px; border-radius: 50%; background: #ddd; display: inline-block; vertical-align: middle; margin-right: 6px; }
.members-table .sub { color: #888; font-size: 0.93em; }

/* ===== PROGRESS TABLE ===== */
.progress-table { display: block; position: relative; height: 13px; }
.progress-line { display: inline-block; height: 7px; border-radius: 3px; min-width: 15px; margin-right: 7px; vertical-align: middle; background: #b36cff; }

/* ===== MEDIA ===== */
@media (max-width: 900px) {
    .dashboard-row { flex-direction: column; }
    .dashboard-board { min-width: 0; width: 100%; }
    .controls { flex-direction: column; gap: 12px; }
    .header-container { padding: 0 16px; }
}

</style>