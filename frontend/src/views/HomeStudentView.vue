<template>
  <div class="home-student-page">
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
    <div class="container">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <h1 class="welcome-title">
          Добро пожаловать, <span class="highlight">{{ userName }}</span>! 👋
        </h1>
        <p class="welcome-subtitle">Ваш прогресс за последнюю неделю:</p>
        <div class="progress-stats">
          <div class="progress-item">
            <div class="progress-circle" :style="progressStyle(85)">
              <span>85%</span>
            </div>
            <div class="progress-label">Выполнено</div>
          </div>
          <div class="progress-item">
            <div class="progress-circle" :style="progressStyle(92)">
              <span>92%</span>
            </div>
            <div class="progress-label">Посещаемость</div>
          </div>
          <div class="progress-item">
            <div class="progress-circle" :style="progressStyle(78)">
              <span>4.2</span>
            </div>
            <div class="progress-label">Средний балл</div>
          </div>
        </div>
      </div>

      <!-- Recently Visited Courses -->
      <h2 class="section-title">
        <i class="fas fa-history"></i> Недавно посещённые курсы
      </h2>
      <div class="courses-recommend">
        <div v-for="course in recentCourses" :key="course.id" class="course-card-wrapper">
          <router-link :to="`/student/courses/${course.id}`" class="course-card">
            <div class="course-image">
              <img :src="course.image" :alt="course.title">
              <div v-if="course.progress > 0" class="progress-overlay">
                <div class="progress-bar" :style="{ width: course.progress + '%' }"></div>
                <span class="progress-text">{{ course.progress }}% завершено</span>
              </div>
            </div>
            <div class="course-content">
              <div class="course-meta">
                <span class="course-subject">{{ course.subject }}</span>
                <span class="course-teacher">{{ course.teacher }}</span>
              </div>
              <h3 class="course-title">{{ course.title }}</h3>
              <p class="desc">{{ course.description }}</p>
              <div class="course-stats">
                <div class="stat">
                  <i class="fas fa-book"></i>
                  <span>{{ course.modules }} модулей</span>
                </div>
                <div class="stat">
                  <i class="fas fa-tasks"></i>
                  <span>{{ course.assignments }} заданий</span>
                </div>
              </div>
              <div class="course-footer">
                <span class="deadline" v-if="course.upcomingDeadline">
                  <i class="fas fa-clock"></i>
                  До {{ formatDate(course.upcomingDeadline) }}
                </span>
              </div>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Dashboard Row -->
      <div class="dashboard-row">
        <!-- Tasks Card -->
        <router-link to="/student/task" class="dashboard-card tasks-card">
          <div class="card-header">
            <div class="tasks-title">
              <i class="fas fa-clipboard-list"></i> Мои задания
            </div>
            <button class="view-all" @click.prevent="navigateToTasks">
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
          <div class="task-stats">
            <div class="stat">
              <span class="number" :class="{'urgent': urgentAssignments > 0}">
                {{ urgentAssignments }}
              </span>
              <small>Срочные</small>
            </div>
            <div class="stat">
              <span class="number">{{ stats.completed }}</span>
              <small>Завершено</small>
            </div>
            <div class="stat">
              <span class="number">{{ stats.pending }}</span>
              <small>Ожидает</small>
            </div>
            <div class="stat">
              <span class="number">{{ stats.total }}</span>
              <small>Всего</small>
            </div>
          </div>
          <div class="upcoming-tasks">
            <h4>Ближайшие задания:</h4>
            <ul>
              <li v-for="task in upcomingTasks" :key="task.id" class="task-item">
                <i class="fas" :class="getTaskIcon(task.subject)"></i>
                <div class="task-info">
                  <span class="task-title">{{ task.title }}</span>
                  <span class="task-deadline">
                    <i class="fas fa-clock"></i>
                    {{ formatDeadline(task.deadline) }}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </router-link>

        <!-- Schedule Card -->
        <div class="dashboard-card schedule-card">
          <div class="schedule-header">
            <span class="schedule-title">
              <i class="fas fa-calendar-alt"></i> Расписание на сегодня
            </span>
            <span class="calendar-icon">📅</span>
          </div>
          <div class="schedule-content">
            <div class="current-time">
              <i class="fas fa-clock"></i>
              <span>{{ currentTime }}</span>
            </div>
            <ul class="schedule-list">
              <li v-for="(item, index) in todaySchedule" :key="index" class="schedule-item" 
                  :class="{'current': isCurrent(item), 'passed': isPassed(item)}">
                <div class="schedule-time">
                  <i class="fas fa-clock"></i>
                  {{ item.time }}
                </div>
                <div class="schedule-details">
                  <div class="schedule-subject">{{ item.subject }}</div>
                  <div class="schedule-meta">
                    <span class="schedule-type">{{ item.type }}</span>
                    <span class="schedule-location">
                      <i class="fas fa-map-marker-alt"></i>
                      {{ item.location }}
                    </span>
                    <span class="schedule-teacher">
                      <i class="fas fa-user-graduate"></i>
                      {{ item.teacher }}
                    </span>
                  </div>
                </div>
                <button v-if="item.link" class="join-btn" @click="joinClass(item)">
                  <i class="fas fa-video"></i> Присоединиться
                </button>
              </li>
            </ul>
          </div>
          <div class="schedule-footer">
            <button class="full-schedule-btn" @click="viewFullSchedule">
              <i class="fas fa-calendar-week"></i> Полное расписание
            </button>
          </div>
        </div>
      </div>

      <!-- Courses Overview -->
      <div class="section-header">
        <h2 class="section-title">
          <i class="fas fa-graduation-cap"></i> Все курсы
        </h2>
        <div class="view-controls">
          <button class="view-btn" :class="{active: viewMode === 'grid'}" @click="viewMode = 'grid'">
            <i class="fas fa-th"></i>
          </button>
          <button class="view-btn" :class="{active: viewMode === 'list'}" @click="viewMode = 'list'">
            <i class="fas fa-list"></i>
          </button>
        </div>
      </div>
      <div class="courses-overview" :class="viewMode">
        <div v-for="course in allCourses" :key="course.id" class="course-card-wrapper">
          <router-link :to="`/student/courses/${course.id}`" class="course-card">
            <div class="course-image">
              <img :src="course.image" :alt="course.title">
              <div class="course-badge" :class="course.status">
                {{ getStatusText(course.status) }}
              </div>
              <div v-if="course.progress > 0" class="progress-overlay">
                <div class="progress-bar" :style="{ width: course.progress + '%' }"></div>
              </div>
            </div>
            <div class="course-content">
              <div class="course-header">
                <h3 class="course-title">{{ course.title }}</h3>
                <div class="course-rating">
                  <i class="fas fa-star" v-for="n in 5" :key="n" 
                     :class="{filled: n <= course.rating}"></i>
                  <span>({{ course.reviews }})</span>
                </div>
              </div>
              <p class="desc">{{ course.description }}</p>
              <div class="course-info">
                <div class="info-item">
                  <i class="fas fa-user-graduate"></i>
                  <span>{{ course.teacher }}</span>
                </div>
                <div class="info-item">
                  <i class="fas fa-clock"></i>
                  <span>{{ course.duration }} недель</span>
                </div>
                <div class="info-item">
                  <i class="fas fa-users"></i>
                  <span>{{ course.students }} студентов</span>
                </div>
              </div>
              <div class="course-footer">
                <div class="progress-info" v-if="course.progress > 0">
                  <div class="progress-container">
                    <div class="progress-bar-small" :style="{ width: course.progress + '%' }"></div>
                  </div>
                  <span class="progress-text">{{ course.progress }}%</span>
                </div>
                <div v-else class="start-course">
                  <button class="start-btn" @click.prevent="startCourse(course)">
                    <i class="fas fa-play"></i> Начать
                  </button>
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="allCourses.length === 0" class="empty-courses">
        <div class="empty-icon">
          <i class="fas fa-graduation-cap"></i>
        </div>
        <h3>Курсы не найдены</h3>
        <p>На данный момент у вас нет доступных курсов</p>
        <button class="explore-btn" @click="exploreCourses">
          <i class="fas fa-compass"></i> Изучить доступные курсы
        </button>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h3 class="section-title">
          <i class="fas fa-bolt"></i> Быстрые действия
        </h3>
        <div class="actions-grid">
          <button class="action-card" @click="submitAssignment">
            <div class="action-icon">
              <i class="fas fa-file-upload"></i>
            </div>
            <span>Сдать задание</span>
          </button>
          <button class="action-card" @click="viewGrades">
            <div class="action-icon">
              <i class="fas fa-star"></i>
            </div>
            <span>Посмотреть оценки</span>
          </button>
          <button class="action-card" @click="scheduleMeeting">
            <div class="action-icon">
              <i class="fas fa-calendar-plus"></i>
            </div>
            <span>Записаться на консультацию</span>
          </button>
          <button class="action-card" @click="downloadMaterials">
            <div class="action-icon">
              <i class="fas fa-download"></i>
            </div>
            <span>Скачать материалы</span>
          </button>
          <button class="action-card" @click="askQuestion">
            <div class="action-icon">
              <i class="fas fa-question-circle"></i>
            </div>
            <span>Задать вопрос</span>
          </button>
          <button class="action-card" @click="joinForum">
            <div class="action-icon">
              <i class="fas fa-comments"></i>
            </div>
            <span>Форум обсуждений</span>
          </button>
        </div>
      </div>

      <!-- Announcements -->
      <div class="announcements-section">
        <h3 class="section-title">
          <i class="fas fa-bullhorn"></i> Важные объявления
        </h3>
        <div class="announcements-list">
          <div v-for="announcement in announcements" :key="announcement.id" 
               class="announcement-card" :class="{'urgent': announcement.priority === 'high'}">
            <div class="announcement-icon">
              <i class="fas" :class="getAnnouncementIcon(announcement.type)"></i>
            </div>
            <div class="announcement-content">
              <div class="announcement-header">
                <h4>{{ announcement.title }}</h4>
                <span class="announcement-time">{{ formatTimeAgo(announcement.date) }}</span>
              </div>
              <p>{{ announcement.message }}</p>
              <div class="announcement-footer">
                <span class="announcement-course">{{ announcement.course }}</span>
                <button class="announcement-action" @click="viewAnnouncement(announcement)">
                  Подробнее <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

// Router and Store
const router = useRouter();
const authStore = useAuthStore();

// Refs
const unreadNotifications = ref(3);
const viewMode = ref('grid');
const showSuccessNotification = ref(false);
const successMessage = ref('');
const currentTime = ref('');

// Data
const recentCourses = ref([
  {
    id: 1,
    title: 'Введение в программирование',
    subject: 'Информатика',
    teacher: 'Иванов А.А.',
    image: 'https://cchgeu.ru/upload/resize_cache/iblock/19c/5nzxpiukzw6wx11r2fira17rti9prvev/1200_1200_1/Fv2ykckoWd4.jpg',
    description: 'Основы программирования на Python. От переменных до функций.',
    modules: 12,
    assignments: 8,
    progress: 75,
    upcomingDeadline: '2024-06-18'
  },
  {
    id: 2,
    title: 'Высшая математика',
    subject: 'Математика',
    teacher: 'Петрова С.И.',
    image: 'https://cchgeu.ru/upload/resize_cache/iblock/19c/5nzxpiukzw6wx11r2fira17rti9prvev/1200_1200_1/Fv2ykckoWd4.jpg',
    description: 'Линейная алгебра, математический анализ, теория вероятностей.',
    modules: 16,
    assignments: 10,
    progress: 60,
    upcomingDeadline: '2024-06-20'
  },
  {
    id: 3,
    title: 'Физика для программистов',
    subject: 'Физика',
    teacher: 'Сидоров В.П.',
    image: 'https://cchgeu.ru/upload/resize_cache/iblock/19c/5nzxpiukzw6wx11r2fira17rti9prvev/1200_1200_1/Fv2ykckoWd4.jpg',
    description: 'Основы механики, электричества и магнетизма.',
    modules: 10,
    assignments: 6,
    progress: 90,
    upcomingDeadline: '2024-06-15'
  }
]);

const stats = ref({
  completed: 37,
  pending: 47,
  total: 822,
  urgent: 3
});

const urgentAssignments = computed(() => stats.value.urgent);

const upcomingTasks = ref([
  {
    id: 1,
    title: 'Лабораторная работа №5',
    subject: 'Информатика',
    deadline: '2024-06-15T23:59:00',
    priority: 'high'
  },
  {
    id: 2,
    title: 'Контрольная работа по математике',
    subject: 'Математика',
    deadline: '2024-06-18T10:00:00',
    priority: 'medium'
  },
  {
    id: 3,
    title: 'Реферат по физике',
    subject: 'Физика',
    deadline: '2024-06-20T17:00:00',
    priority: 'low'
  }
]);

const todaySchedule = ref([
  {
    time: '10:20 - 11:00',
    subject: 'Математика',
    type: 'Лекция',
    location: 'Аудитория 318A',
    teacher: 'Петрова С.И.',
    link: 'https://meet.google.com/abc-defg-hij'
  },
  {
    time: '11:10 - 12:00',
    subject: 'Информатика',
    type: 'Практика',
    location: 'Компьютерный класс 205',
    teacher: 'Иванов А.А.',
    link: null
  },
  {
    time: '12:10 - 12:50',
    subject: 'Физика',
    type: 'Лекция',
    location: 'Аудитория 415',
    teacher: 'Сидоров В.П.',
    link: 'https://meet.google.com/xyz-uvw-rst'
  },
  {
    time: '14:00 - 15:30',
    subject: 'Английский язык',
    type: 'Семинар',
    location: 'Аудитория 102',
    teacher: 'Кузнецова О.Л.',
    link: null
  }
]);

const allCourses = ref([
  {
    id: 1,
    title: 'Введение в программирование',
    subject: 'Информатика',
    teacher: 'Иванов А.А.',
    image: 'https://cchgeu.ru/upload/resize_cache/iblock/19c/5nzxpiukzw6wx11r2fira17rti9prvev/1200_1200_1/Fv2ykckoWd4.jpg',
    description: 'Основы программирования на Python. От переменных до функций.',
    modules: 12,
    assignments: 8,
    progress: 75,
    duration: 16,
    students: 45,
    rating: 4,
    reviews: 28,
    status: 'active'
  },
  {
    id: 2,
    title: 'Высшая математика',
    subject: 'Математика',
    teacher: 'Петрова С.И.',
    image: 'https://cchgeu.ru/upload/resize_cache/iblock/19c/5nzxpiukzw6wx11r2fira17rti9prvev/1200_1200_1/Fv2ykckoWd4.jpg',
    description: 'Линейная алгебра, математический анализ, теория вероятностей.',
    modules: 16,
    assignments: 10,
    progress: 60,
    duration: 20,
    students: 38,
    rating: 5,
    reviews: 32,
    status: 'active'
  },
  {
    id: 3,
    title: 'Физика для программистов',
    subject: 'Физика',
    teacher: 'Сидоров В.П.',
    image: 'https://cchgeu.ru/upload/resize_cache/iblock/19c/5nzxpiukzw6wx11r2fira17rti9prvev/1200_1200_1/Fv2ykckoWd4.jpg',
    description: 'Основы механики, электричества и магнетизма.',
    modules: 10,
    assignments: 6,
    progress: 90,
    duration: 14,
    students: 42,
    rating: 4,
    reviews: 25,
    status: 'active'
  },
  {
    id: 4,
    title: 'Базы данных',
    subject: 'Информатика',
    teacher: 'Козлов Д.В.',
    image: 'https://cchgeu.ru/upload/resize_cache/iblock/19c/5nzxpiukzw6wx11r2fira17rti9prvev/1200_1200_1/Fv2ykckoWd4.jpg',
    description: 'Проектирование и реализация баз данных SQL.',
    modules: 14,
    assignments: 9,
    progress: 0,
    duration: 18,
    students: 36,
    rating: 4,
    reviews: 19,
    status: 'upcoming'
  },
  {
    id: 5,
    title: 'Веб-разработка',
    subject: 'Информатика',
    teacher: 'Морозова Е.С.',
    image: 'https://cchgeu.ru/upload/resize_cache/iblock/19c/5nzxpiukzw6wx11r2fira17rti9prvev/1200_1200_1/Fv2ykckoWd4.jpg',
    description: 'HTML, CSS, JavaScript и основы фреймворков.',
    modules: 15,
    assignments: 12,
    progress: 30,
    duration: 22,
    students: 50,
    rating: 5,
    reviews: 41,
    status: 'active'
  },
  {
    id: 6,
    title: 'Алгоритмы и структуры данных',
    subject: 'Информатика',
    teacher: 'Федоров М.А.',
    image: 'https://cchgeu.ru/upload/resize_cache/iblock/19c/5nzxpiukzw6wx11r2fira17rti9prvev/1200_1200_1/Fv2ykckoWd4.jpg',
    description: 'Сложность алгоритмов, деревья, графы, сортировки.',
    modules: 18,
    assignments: 15,
    progress: 0,
    duration: 24,
    students: 40,
    rating: 4,
    reviews: 22,
    status: 'upcoming'
  }
]);

const announcements = ref([
  {
    id: 1,
    title: 'Изменение расписания',
    type: 'schedule',
    message: 'Лекция по математике перенесена с 15 июня на 17 июня, 10:00.',
    course: 'Высшая математика',
    date: '2024-06-13T14:30:00',
    priority: 'high'
  },
  {
    id: 2,
    title: 'Новые материалы',
    type: 'materials',
    message: 'Добавлены новые учебные материалы по лабораторной работе №4.',
    course: 'Введение в программирование',
    date: '2024-06-12T09:15:00',
    priority: 'medium'
  },
  {
    id: 3,
    title: 'Консультация преподавателя',
    type: 'meeting',
    message: 'Преподаватель Иванов А.А. проводит дополнительные консультации в четверг с 14:00 до 16:00.',
    course: 'Введение в программирование',
    date: '2024-06-11T16:45:00',
    priority: 'low'
  }
]);

// Computed properties
const userName = computed(() => {
  return authStore.user?.name || 'Иван Иванов';
});

const currentSchedule = computed(() => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  return todaySchedule.value.find(item => {
    const [start, end] = item.time.split(' - ');
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    
    const currentTime = currentHour * 60 + currentMinute;
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    return currentTime >= startTime && currentTime <= endTime;
  });
});

// Methods
const toggleSearch = () => {
  console.log('Открыть поиск');
  // В реальном приложении здесь можно открыть модальное окно поиска
};

const toggleNotifications = () => {
  unreadNotifications.value = 0;
  console.log('Показать уведомления');
  router.push('/student/notifications');
};

const openChat = () => {
  console.log('Открыть чат');
  router.push('/student/chat');
};

const progressStyle = (percentage) => {
  const hue = Math.floor(percentage * 1.2); // 0-120 для цветов от красного к зеленому
  return {
    background: `conic-gradient(hsl(${hue}, 80%, 60%) ${percentage}%, #f0f0f0 0)`
  };
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  });
};

const navigateToTasks = () => {
  router.push('/student/tasks');
};

const getTaskIcon = (subject) => {
  const icons = {
    'Информатика': 'fa-code',
    'Математика': 'fa-calculator',
    'Физика': 'fa-atom',
    'Английский язык': 'fa-language'
  };
  return icons[subject] || 'fa-tasks';
};

const formatDeadline = (deadlineString) => {
  const deadline = new Date(deadlineString);
  const now = new Date();
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Сегодня';
  } else if (diffDays === 1) {
    return 'Завтра';
  } else if (diffDays < 0) {
    return 'Просрочено';
  } else {
    return `Через ${diffDays} дней`;
  }
};

const updateCurrentTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const isCurrent = (item) => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  const [start, end] = item.time.split(' - ');
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  
  const currentTime = currentHour * 60 + currentMinute;
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;
  
  return currentTime >= startTime && currentTime <= endTime;
};

const isPassed = (item) => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  const [start, end] = item.time.split(' - ');
  const [endHour, endMinute] = end.split(':').map(Number);
  
  const currentTime = currentHour * 60 + currentMinute;
  const endTime = endHour * 60 + endMinute;
  
  return currentTime > endTime;
};

const joinClass = (item) => {
  if (item.link) {
    window.open(item.link, '_blank');
    console.log('Присоединяемся к занятию:', item.subject);
  } else {
    alert('Ссылка для подключения недоступна');
  }
};

const viewFullSchedule = () => {
  router.push('/student/schedule');
};

const getStatusText = (status) => {
  switch(status) {
    case 'active': return 'В процессе';
    case 'upcoming': return 'Скоро начнется';
    case 'completed': return 'Завершен';
    default: return status;
  }
};

const startCourse = (course) => {
  course.progress = 1;
  course.status = 'active';
  console.log('Курс начат:', course.title);
  showSuccess(`Курс "${course.title}" добавлен в ваши активные курсы`);
};

const exploreCourses = () => {
  router.push('/student/courses');
};

const submitAssignment = () => {
  router.push('/student/assignments/submit');
};

const viewGrades = () => {
  router.push('/student/grades');
};

const scheduleMeeting = () => {
  router.push('/student/meetings');
};

const downloadMaterials = () => {
  router.push('/student/materials');
};

const askQuestion = () => {
  router.push('/student/chat');
};

const joinForum = () => {
  router.push('/student/forum');
};

const getAnnouncementIcon = (type) => {
  const icons = {
    'schedule': 'fa-calendar-alt',
    'materials': 'fa-file-download',
    'meeting': 'fa-users',
    'deadline': 'fa-clock',
    'general': 'fa-bullhorn'
  };
  return icons[type] || 'fa-info-circle';
};

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) {
    return `${diffMins} минут назад`;
  } else if (diffHours < 24) {
    return `${diffHours} часов назад`;
  } else if (diffDays === 1) {
    return 'Вчера';
  } else {
    return `${diffDays} дней назад`;
  }
};

const viewAnnouncement = (announcement) => {
  console.log('Просмотр объявления:', announcement.title);
  // В реальном приложении здесь можно открыть детальное представление объявления
  alert(announcement.message);
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
let timeInterval;
onMounted(() => {
  console.log('HomeStudentView загружен');
  updateCurrentTime();
  timeInterval = setInterval(updateCurrentTime, 60000); // Обновлять каждую минуту
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>

<style>
/* ===== Base ===== */
:root {
  --primary: #6940EE;
  --primary-hover: #4C2CB8;
  --success: #14C856;
  --danger: #FF4625;

  --bg-main: #FAFAFC;
  --bg-card: #FFFFFF;
  --bg-dark: #1D1D1D;
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

/* ===== Welcome Section ===== */
.welcome-section {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: var(--shadow-soft);
}

.welcome-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 12px;
  color: var(--text-main);
}

.welcome-title .highlight {
  color: var(--primary);
}

.welcome-subtitle {
  font-size: 1.1rem;
  color: var(--text-muted);
  margin: 0 0 24px;
}

.progress-stats {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.progress-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  color: white;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 0.95rem;
  color: var(--text-muted);
}

/* ===== Section Title ===== */
.section-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-muted);
  margin: 0 0 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title i {
  color: var(--primary);
}

/* ===== Recently Visited Courses ===== */
.courses-recommend {
  display: flex;
  gap: 22px;
  margin-bottom: 40px;
}

.course-card-wrapper {
  flex: 1;
}

.course-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  box-shadow: var(--shadow-soft);
  transition: transform 0.2s, box-shadow 0.2s;
  display: block;
  height: 100%;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.course-image {
  position: relative;
  width: 100%;
  height: 120px;
  overflow: hidden;
}

.course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.progress-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  font-size: 0.8rem;
}

.progress-bar {
  height: 4px;
  background: var(--primary);
  border-radius: 2px;
  margin-bottom: 4px;
}

.progress-text {
  display: block;
  font-size: 0.75rem;
  opacity: 0.9;
}

.course-content {
  padding: 18px;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.course-subject {
  background: var(--border-soft);
  padding: 2px 8px;
  border-radius: 10px;
}

.course-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 8px;
  color: var(--text-main);
}

.desc {
  font-size: 0.95rem;
  line-height: 1.4;
  color: var(--text-muted);
  margin: 0 0 16px;
}

.course-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.course-stats .stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.course-stats i {
  color: var(--primary);
}

.course-footer {
  border-top: 1px solid var(--border-soft);
  padding-top: 12px;
}

.deadline {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--danger);
}

.deadline i {
  font-size: 0.9rem;
}

/* ===== Dashboard Row ===== */
.dashboard-row {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 24px;
  margin: 40px 0;
}

.dashboard-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  text-decoration: none;
  color: inherit;
  box-shadow: var(--shadow-soft);
  transition: transform 0.2s, box-shadow 0.2s;
  display: block;
}

.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

/* ===== Tasks Card ===== */
.tasks-card {
  background: linear-gradient(135deg, var(--primary), var(--primary-hover));
  color: #fff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tasks-title {
  font-size: 1.2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
}

.view-all {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.view-all:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(2px);
}

.task-stats {
  display: flex;
  gap: 32px;
  margin-top: 22px;
}

.task-stats .stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.task-stats .number {
  font-size: 1.8rem;
  font-weight: 700;
  display: block;
}

.task-stats .number.urgent {
  color: var(--warning);
}

.task-stats small {
  opacity: 0.85;
  font-size: 0.9rem;
}

.upcoming-tasks {
  margin-top: 24px;
}

.upcoming-tasks h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 12px;
  opacity: 0.9;
}

.upcoming-tasks ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.task-item:last-child {
  border-bottom: none;
}

.task-item i {
  color: var(--warning);
  font-size: 1.1rem;
  width: 20px;
}

.task-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-title {
  font-size: 0.95rem;
  opacity: 0.9;
}

.task-deadline {
  font-size: 0.85rem;
  opacity: 0.8;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ===== Schedule Card ===== */
.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  margin-bottom: 14px;
}

.schedule-title {
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.schedule-title i {
  color: var(--primary);
}

.calendar-icon {
  font-size: 1.5rem;
}

.schedule-content {
  margin-top: 20px;
}

.current-time {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 10px 12px;
  background: var(--border-soft);
  border-radius: var(--radius-sm);
  font-weight: 600;
}

.current-time i {
  color: var(--primary);
}

.schedule-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.schedule-item {
  padding: 16px 12px;
  border-bottom: 1px solid var(--border-soft);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
}

.schedule-item:hover {
  background: rgba(105, 64, 238, 0.05);
}

.schedule-item.current {
  background: rgba(105, 64, 238, 0.1);
  border-left: 4px solid var(--primary);
}

.schedule-item.passed {
  opacity: 0.6;
}

.schedule-time {
  color: var(--primary);
  font-weight: 600;
  min-width: 100px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.schedule-details {
  flex: 1;
  margin: 0 16px;
}

.schedule-subject {
  font-weight: 600;
  margin-bottom: 4px;
}

.schedule-meta {
  display: flex;
  gap: 16px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.schedule-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.join-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  white-space: nowrap;
}

.join-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.schedule-footer {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border-soft);
}

.full-schedule-btn {
  width: 100%;
  padding: 12px;
  background: var(--bg-main);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  color: var(--text-main);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.full-schedule-btn:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

/* ===== Courses Overview ===== */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 40px 0 20px;
}

.view-controls {
  display: flex;
  gap: 8px;
}

.view-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--border-soft);
  background: white;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.view-btn:hover, .view-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.courses-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.courses-overview.list {
  grid-template-columns: 1fr;
}

.courses-overview.list .course-card {
  display: flex;
}

.courses-overview.list .course-image {
  width: 200px;
  height: auto;
  flex-shrink: 0;
}

.courses-overview.list .course-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.course-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--primary);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.course-badge.active {
  background: var(--success);
}

.course-badge.coming {
  background: var(--warning);
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.course-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.course-rating i {
  color: #ddd;
  font-size: 0.9rem;
}

.course-rating i.filled {
  color: #FFD700;
}

.course-rating span {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-left: 4px;
}

.course-info {
  display: flex;
  gap: 16px;
  margin: 16px 0;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.info-item i {
  color: var(--primary);
}

.course-footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--border-soft);
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-container {
  flex: 1;
  height: 6px;
  background: var(--border-soft);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-small {
  height: 100%;
  background: var(--primary);
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--primary);
  min-width: 40px;
}

.start-course {
  display: flex;
  justify-content: center;
}

.start-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.start-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
}

/* ===== Empty State ===== */
.empty-courses {
  text-align: center;
  padding: 48px 32px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  margin-bottom: 40px;
  box-shadow: var(--shadow-soft);
}

.empty-icon {
  font-size: 3rem;
  color: var(--border-soft);
  margin-bottom: 20px;
}

.empty-courses h3 {
  font-size: 1.5rem;
  margin: 0 0 12px;
  color: var(--text-main);
}

.empty-courses p {
  font-size: 1rem;
  color: var(--text-muted);
  margin: 0 0 24px;
}

.explore-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
}

.explore-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

/* ===== Quick Actions ===== */
.quick-actions {
  margin-bottom: 40px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.action-card {
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  padding: 24px 20px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: var(--shadow-soft);
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
  border-color: var(--primary);
  background: linear-gradient(135deg, var(--bg-card), rgba(105, 64, 238, 0.05));
}

.action-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-hover));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 1.5rem;
  color: white;
  transition: all 0.3s;
}

.action-card:hover .action-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 8px 20px rgba(105, 64, 238, 0.3);
}

.action-card span {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.4;
}

/* ===== Announcements ===== */
.announcements-section {
  margin-bottom: 40px;
}

.announcements-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.announcement-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--border-soft);
  display: flex;
  gap: 20px;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.announcement-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
  border-color: var(--primary);
}

.announcement-card.urgent {
  border-left: 4px solid var(--danger);
  background: linear-gradient(135deg, var(--bg-card), rgba(255, 70, 37, 0.05));
}

.announcement-card.urgent .announcement-icon {
  background: linear-gradient(135deg, var(--danger), #FF7E5F);
}

.announcement-card.urgent .announcement-action {
  background: var(--danger);
}

.announcement-card.urgent .announcement-action:hover {
  background: #E03A1A;
}

.announcement-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-hover));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.announcement-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.announcement-header h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-main);
}

.announcement-time {
  font-size: 0.85rem;
  color: var(--text-muted);
  background: var(--border-soft);
  padding: 4px 10px;
  border-radius: 20px;
  white-space: nowrap;
}

.announcement-content p {
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--text-muted);
  margin: 0 0 16px;
  flex: 1;
}

.announcement-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.announcement-course {
  font-size: 0.9rem;
  color: var(--text-muted);
  background: var(--border-soft);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
}

.announcement-action {
  background: var(--primary);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  white-space: nowrap;
}

.announcement-action:hover {
  background: var(--primary-hover);
  transform: translateX(4px);
}

/* ===== Success Notification ===== */
.success-notification {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: linear-gradient(135deg, var(--success), #2ECC71);
  color: white;
  padding: 16px 24px;
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 32px rgba(20, 200, 86, 0.3);
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideInRight 0.3s ease;
  z-index: 1001;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.success-notification i {
  font-size: 1.2rem;
}

.success-notification span {
  font-size: 0.95rem;
  font-weight: 600;
}

.close-notification {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  transition: all 0.2s;
}

.close-notification:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

/* ===== Adaptive ===== */
@media (max-width: 900px) {
  .courses-recommend {
    flex-direction: column;
  }
  
  .dashboard-row {
    grid-template-columns: 1fr;
  }
  
  .courses-overview {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .announcement-footer {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .announcement-action {
    width: 100%;
    justify-content: center;
  }
  
  .progress-stats {
    justify-content: center;
  }
}

@media (max-width: 600px) {
  .container {
    padding: 24px 5vw 40px;
  }
  
  .courses-overview {
    grid-template-columns: 1fr;
  }
  
  .header-right span {
    display: none;
  }
  
  .user-info span {
    display: none;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .welcome-title {
    font-size: 1.5rem;
  }
  
  .announcement-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .announcement-time {
    align-self: flex-start;
  }
  
  .success-notification {
    left: 16px;
    right: 16px;
    bottom: 16px;
  }
}
</style>
