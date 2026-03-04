<template>
  <div class="home-teacher-page">
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

    <!-- Main Container -->
    <div class="container">
      <!-- Sidebar -->
      <div class="sidebar">
        <div class="panel">
          <div class="panel-title">Панель управления</div>
          
          <router-link to="/teacher/createCourse" class="create-course-btn">
            Создать курс
          </router-link>
          
          <div class="calendar-box">
            <div class="calendar-header">
              <button class="calendar-nav" @click="prevMonth">
                <i class="fas fa-chevron-left"></i>
              </button>
              <div class="calendar-month">{{ currentMonth }}</div>
              <button class="calendar-nav" @click="nextMonth">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
            
            <table class="calendar-table">
              <thead>
                <tr>
                  <th v-for="day in daysOfWeek" :key="day">{{ day }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="week in calendarWeeks" :key="week.id">
                  <td v-for="day in week" 
                      :key="day.date"
                      :class="{
                        'today': day.isToday,
                        'event-day': day.hasEvent,
                        'other-month': !day.isCurrentMonth
                      }"
                      @click="selectDate(day.date)">
                    {{ day.day }}
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div class="calendar-events">
              <h4>События на {{ selectedDate ? formatDate(selectedDate) : 'сегодня' }}</h4>
              <ul>
                <li v-for="event in eventsForSelectedDate" :key="event.id">
                  <span class="event-time">{{ event.time }}</span>
                  <span class="event-title">{{ event.title }}</span>
                </li>
                <li v-if="eventsForSelectedDate.length === 0">
                  Нет событий
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Recently Visited Courses -->
        <div class="recent-courses">
          <div class="recent-courses-title">Недавно посещенные курсы</div>
          <div class="recent-courses-list">
            <router-link v-for="course in recentCourses" 
                         :key="course.id"
                         :to="`/teacher/course/${course.id}`"
                         class="recent-course-card">
              <img class="recent-course-img" 
                   :src="course.image" 
                   :alt="course.title">
              <div class="recent-course-title">{{ course.title }}</div>
            </router-link>
          </div>
        </div>

        <!-- Courses Overview -->
        <div class="courses-overview">
          <div class="courses-overview-header">
            <div class="courses-overview-title">Обзор курсов</div>
            <div class="courses-overview-search">
              <input type="text" 
                     v-model="searchQuery" 
                     placeholder="Найти курс..."
                     @input="filterCourses">
            </div>
          </div>
          <div class="courses-list">
            <router-link v-for="course in filteredCourses" 
                         :key="course.id"
                         :to="`/teacher/course/${course.id}`"
                         class="course-card">
              <img class="course-card-img" 
                   :src="course.image" 
                   :alt="course.title">
              <div class="course-card-body">
                <div class="course-card-title">{{ course.title }}</div>
                <div class="course-card-desc">{{ course.description }}</div>
                <div class="course-card-meta">
                  <span class="students-count">
                    <i class="fas fa-users"></i> {{ course.studentsCount }} студентов
                  </span>
                  <span class="tasks-count">
                    <i class="fas fa-tasks"></i> {{ course.tasksCount }} заданий
                  </span>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Search Modal -->
    <div v-if="showSearchModal" class="modal-overlay" @click="closeSearchModal">
      <div class="search-modal" @click.stop>
        <div class="search-header">
          <h3>Поиск по курсам</h3>
          <button class="close-btn" @click="closeSearchModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="search-input-container">
          <input type="text" 
                 v-model="globalSearchQuery" 
                 placeholder="Введите название курса..."
                 @keyup.enter="performGlobalSearch">
          <button class="search-btn" @click="performGlobalSearch">
            <i class="fas fa-search"></i>
          </button>
        </div>
        <div v-if="globalSearchResults.length > 0" class="search-results">
          <h4>Результаты поиска:</h4>
          <div class="search-results-list">
            <router-link v-for="result in globalSearchResults" 
                         :key="result.id"
                         :to="`/teacher/course/${result.id}`"
                         class="search-result-item"
                         @click="closeSearchModal">
              <div class="search-result-title">{{ result.title }}</div>
              <div class="search-result-desc">{{ result.description }}</div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';

// Реактивные состояния
const searchQuery = ref('');
const globalSearchQuery = ref('');
const showSearchModal = ref(false);
const unreadNotifications = ref(5);
const currentDate = ref(new Date());
const selectedDate = ref(new Date());
const globalSearchResults = ref([]);

// Дни недели для календаря
const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// Календарные события (в реальном приложении будут из API)
const events = ref([
  { id: 1, date: new Date('2024-06-10'), time: '10:00–11:30', title: 'Apple Keynote' },
  { id: 2, date: new Date('2024-06-10'), time: '15:30–16:00', title: 'Product meeting' },
  { id: 3, date: new Date('2024-06-22'), time: '14:00–15:30', title: 'Совещание по курсу' },
  { id: 4, date: new Date('2024-06-22'), time: '17:00–18:00', title: 'Консультация студентов' }
]);

// Курсы (в реальном приложении будут из API)
const allCourses = ref([
  { 
    id: 1, 
    title: 'Введение в программирование', 
    description: 'Основы программирования на Python для начинающих студентов',
    image: 'https://cchgeu.ru/upload/resize_cache/iblock/19c/5nzxpiukzw6wx11r2fira17rti9prvev/1200_1200_1/Fv2ykckoWd4.jpg',
    studentsCount: 45,
    tasksCount: 8,
    lastVisited: '2024-06-08'
  },
  { 
    id: 2, 
    title: 'Математический анализ', 
    description: 'Пределы, производные, интегралы и их приложения в технических науках',
    image: 'https://cchgeu.ru/upload/resize_cache/iblock/19c/5nzxpiukzw6wx11r2fira17rti9prvev/1200_1200_1/Fv2ykckoWd4.jpg',
    studentsCount: 38,
    tasksCount: 12,
    lastVisited: '2024-06-05'
  },
  { 
    id: 3, 
    title: 'Базы данных', 
    description: 'Проектирование и реализация реляционных баз данных, SQL запросы',
    image: 'https://cchgeu.ru/upload/resize_cache/iblock/19c/5nzxpiukzw6wx11r2fira17rti9prvev/1200_1200_1/Fv2ykckoWd4.jpg',
    studentsCount: 32,
    tasksCount: 6,
    lastVisited: '2024-06-10'
  },
  { 
    id: 4, 
    title: 'Веб-разработка', 
    description: 'Создание современных веб-приложений с использованием HTML, CSS и JavaScript',
    image: 'https://cchgeu.ru/upload/resize_cache/iblock/19c/5nzxpiukzw6wx11r2fira17rti9prvev/1200_1200_1/Fv2ykckoWd4.jpg',
    studentsCount: 28,
    tasksCount: 10,
    lastVisited: '2024-06-03'
  }
]);

// Получаем информацию о пользователе
const authStore = useAuthStore();
const userName = computed(() => {
  return authStore.user?.name || 'Иван Иванов';
});

// Недавние курсы (последние 4 посещенных)
const recentCourses = computed(() => {
  return [...allCourses.value]
    .sort((a, b) => new Date(b.lastVisited) - new Date(a.lastVisited))
    .slice(0, 4);
});

// Фильтрация курсов по поисковому запросу
const filteredCourses = computed(() => {
  if (!searchQuery.value.trim()) {
    return allCourses.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return allCourses.value.filter(course => 
    course.title.toLowerCase().includes(query) ||
    course.description.toLowerCase().includes(query)
  );
});

// Календарь
const currentMonth = computed(() => {
  return currentDate.value.toLocaleDateString('ru-RU', { 
    month: 'long', 
    year: 'numeric' 
  }).toUpperCase();
});

const calendarWeeks = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const days = [];
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  
  // Дни предыдущего месяца
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i);
    days.push({
      date: date,
      day: prevMonthLastDay - i,
      isCurrentMonth: false,
      isToday: false,
      hasEvent: hasEventOnDate(date)
    });
  }
  
  // Дни текущего месяца
  const today = new Date();
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i);
    days.push({
      date: date,
      day: i,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      hasEvent: hasEventOnDate(date)
    });
  }
  
  // Дни следующего месяца
  const totalCells = 42; // 6 недель
  let nextDay = 1;
  while (days.length < totalCells) {
    const date = new Date(year, month + 1, nextDay);
    days.push({
      date: date,
      day: nextDay,
      isCurrentMonth: false,
      isToday: false,
      hasEvent: hasEventOnDate(date)
    });
    nextDay++;
  }
  
  // Разделяем на недели
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  
  return weeks;
});

const eventsForSelectedDate = computed(() => {
  return events.value.filter(event => 
    isSameDay(event.date, selectedDate.value)
  );
});

// Методы
const toggleSearch = () => {
  showSearchModal.value = true;
};

const closeSearchModal = () => {
  showSearchModal.value = false;
  globalSearchQuery.value = '';
  globalSearchResults.value = [];
};

const performGlobalSearch = () => {
  if (!globalSearchQuery.value.trim()) return;
  
  globalSearchResults.value = allCourses.value.filter(course => 
    course.title.toLowerCase().includes(globalSearchQuery.value.toLowerCase()) ||
    course.description.toLowerCase().includes(globalSearchQuery.value.toLowerCase())
  );
};

const toggleNotifications = () => {
  unreadNotifications.value = 0;
  console.log('Показать уведомления');
};

const openChat = () => {
  console.log('Открыть чат');
};

const filterCourses = () => {
  // Реактивная фильтрация через computed свойство
};

const prevMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  );
};

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  );
};

const selectDate = (date) => {
  selectedDate.value = date;
};

const formatDate = (date) => {
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const hasEventOnDate = (date) => {
  return events.value.some(event => isSameDay(event.date, date));
};

const isSameDay = (date1, date2) => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
};

// При загрузке компонента
onMounted(() => {
  console.log('HomeTeacherView загружен');
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

a {
  text-decoration: none;
  color: var(--primary);
}

img {
  display: block;
  max-width: 100%;
}

/* ===== Header ===== */
.header {
  background: #fff;
  border-bottom: 1px solid var(--border-soft);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 14px 32px;

  display: flex;
  justify-content: space-between;
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
  transition: color 0.2s, transform 0.15s;
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

/* ===== Main container ===== */
.container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 36px 32px 48px;

  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
}

/* ===== Sidebar ===== */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.panel {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-soft);
}

.panel-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.panel a {
  display: inline-block;
  margin-bottom: 18px;
  font-weight: 600;
}

/* Calendar */
.calendar-box {
  font-size: 0.9rem;
}

.calendar-table {
  border-collapse: collapse;
  margin-bottom: 14px;
}

.calendar-table th,
.calendar-table td {
  width: 28px;
  height: 28px;
  text-align: center;
}

.calendar-box ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.calendar-box li span {
  font-weight: 700;
}

/* ===== Main content ===== */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* ===== Recent courses ===== */
.recent-courses {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-soft);
}

.recent-courses-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 18px;
  color: var(--text-muted);
}

.recent-courses-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 18px;
}

.recent-course-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 0;
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.recent-course-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.recent-course-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-top-left-radius: var(--radius-md);
  border-top-right-radius: var(--radius-md);
}

.recent-course-title {
  font-size: 0.9rem;
  padding: 8px 12px;
  color: var(--text-main);
  font-weight: 500;
}


/* ===== Courses overview ===== */
.courses-overview {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-soft);
}

.courses-overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
  gap: 12px;
}

.courses-overview-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-muted);
}

.courses-overview-search input {
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  padding: 8px 14px;
  font-size: 0.9rem;
  outline: none;
}

/* ===== Courses list ===== */
.courses-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.course-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  display: flex;
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  transition: transform 0.2s, box-shadow 0.2s;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.course-card-img {
  width: 120px;
  object-fit: cover;
}

.course-card-body {
  padding: 16px;
}

.course-card-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 6px;
}

.course-card-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* ===== Adaptive ===== */
@media (max-width: 900px) {
  .container {
    grid-template-columns: 1fr;
  }

  .sidebar {
    order: 2;
  }
}

@media (max-width: 600px) {
  .container {
    padding: 24px 5vw 40px;
  }

  .header-right span {
    display: none;
  }

  .courses-overview-header {
    flex-direction: column;
    align-items: stretch;
  }

  .course-card {
    flex-direction: column;
  }

  .course-card-img {
    width: 100%;
    height: 140px;
  }
}

</style>