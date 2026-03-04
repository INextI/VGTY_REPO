<template>
  <div class="home-student-page">
    <!-- Header -->
    <header>
      <div class="header-container">
        <div class="header-left">
          <div class="logo">
            <router-link to="/student/home">
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
    <main class="container">
      <div class="dashboard-card">
        <div class="dashboard-title">{{ task.title }}</div>
        <div class="dashboard-description">{{ task.description }}</div>
        
        <!-- Files -->
        <div class="dashboard-files">
          <a v-for="file in task.files" 
             :key="file.id" 
             :href="file.url" 
             target="_blank" 
             class="file-link">
            {{ file.name }}
          </a>
        </div>

        <!-- Task Block -->
        <div class="task-block">
          <div class="task-label">Ответ на задание</div>
          <div class="answer-area" @click="triggerFileUpload">
            <span v-if="!submittedFile">Добавить ответ в виде файла...</span>
            <div v-else class="submitted-file">
              <i class="fas fa-file"></i>
              {{ submittedFile.name }}
              <button class="remove-file" @click.stop="removeFile">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <input type="file" 
                 ref="fileInput" 
                 style="display: none" 
                 @change="handleFileUpload">
          
          <button class="send-btn" 
                  :disabled="!submittedFile || isSubmitting" 
                  @click="submitTask">
            <span v-if="isSubmitting">
              <i class="fas fa-spinner fa-spin"></i> Отправка...
            </span>
            <span v-else>Отправить</span>
          </button>
          
          <div class="date-row">
            <span>Отправить до</span>
            <span class="due-date">{{ formatDueDate(task.dueDate) }}</span>
          </div>
          
          <div class="status-row">
            <span>Состояние оценивания</span>
            <span :class="['status-value', task.status]">
              {{ getStatusText(task.status) }}
            </span>
          </div>
          
          <div class="comment-label">Комментарий к ответу</div>
          <div class="comment-area">
            {{ task.comment || 'Пока нет комментариев' }}
          </div>
        </div>
      </div>

      <!-- Search Modal -->
      <div v-if="showSearchModal" class="modal-overlay" @click="closeSearchModal">
        <div class="search-modal" @click.stop>
          <div class="search-header">
            <h3>Поиск</h3>
            <button class="close-btn" @click="closeSearchModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="search-input-container">
            <input type="text" 
                   v-model="searchQuery" 
                   placeholder="Введите запрос..."
                   @keyup.enter="performSearch">
            <button class="search-btn" @click="performSearch">
              <i class="fas fa-search"></i>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';

// Реактивные состояния
const fileInput = ref(null);
const submittedFile = ref(null);
const searchQuery = ref('');
const showSearchModal = ref(false);
const isSubmitting = ref(false);
const unreadNotifications = ref(3); // Пример: 3 непрочитанных уведомления

// Данные задачи (в реальном приложении будут приходить с бэкенда)
const task = ref({
  id: 1,
  title: 'Lorem ipsum dolor sit amet, conse...',
  description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  files: [
    { id: 1, name: 'File1.pdf', url: '#' },
    { id: 2, name: 'File2.docx', url: '#' },
    { id: 3, name: 'File3.zip', url: '#' }
  ],
  dueDate: new Date('2024-12-12T17:00:00'),
  status: 'not_evaluated', // 'not_evaluated', 'in_progress', 'completed', 'evaluated'
  comment: null
});

// Получаем информацию о пользователе
const authStore = useAuthStore();
const userName = computed(() => {
  return authStore.user?.name || 'Иван Иванов';
});

// Методы
const triggerFileUpload = () => {
  fileInput.value.click();
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Проверяем размер файла (максимум 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Файл слишком большой. Максимальный размер: 10MB');
      return;
    }
    
    // Проверяем тип файла
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'application/x-rar-compressed',
      'text/plain',
      'image/jpeg',
      'image/png'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Недопустимый тип файла. Разрешены: PDF, DOC, DOCX, ZIP, RAR, TXT, JPG, PNG');
      return;
    }
    
    submittedFile.value = {
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    };
  }
};

const removeFile = () => {
  submittedFile.value = null;
  fileInput.value.value = '';
};

const submitTask = async () => {
  if (!submittedFile.value) return;
  
  isSubmitting.value = true;
  
  try {
    // Здесь будет запрос к API
    // const formData = new FormData();
    // formData.append('file', submittedFile.value.file);
    // formData.append('taskId', task.value.id);
    
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Обновляем статус задачи
    task.value.status = 'in_progress';
    
    alert('Задание успешно отправлено на проверку!');
    
    // Сбрасываем файл после отправки
    submittedFile.value = null;
    fileInput.value.value = '';
    
  } catch (error) {
    console.error('Ошибка при отправке задания:', error);
    alert('Произошла ошибка при отправке задания. Попробуйте снова.');
  } finally {
    isSubmitting.value = false;
  }
};

const toggleSearch = () => {
  showSearchModal.value = true;
};

const closeSearchModal = () => {
  showSearchModal.value = false;
  searchQuery.value = '';
};

const performSearch = () => {
  if (searchQuery.value.trim()) {
    console.log('Поиск:', searchQuery.value);
    // Здесь будет логика поиска
    closeSearchModal();
  }
};

const toggleNotifications = () => {
  // Логика показа уведомлений
  unreadNotifications.value = 0;
  console.log('Показать уведомления');
};

const openChat = () => {
  console.log('Открыть чат');
};

const formatDueDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusText = (status) => {
  const statusMap = {
    'not_evaluated': 'Не оценено',
    'in_progress': 'В процессе проверки',
    'completed': 'Завершено',
    'evaluated': 'Оценено'
  };
  return statusMap[status] || 'Неизвестно';
};

// При загрузке компонента
onMounted(() => {
  console.log('HomeStudentView загружен');
});
</script>

<style scoped>

/* ===== BASE ===== */
:root {
  --primary: #6940ee;
  --primary-hover: #4c2cb8;
  --success: #14c856;
  --danger: #ff4625;

  --bg-main: #fafafc;
  --bg-card: #ffffff;
  --border-soft: #f5f5f5;

  --text-main: #1d1d1d;
  --text-muted: #6f6f7a;

  --radius-lg: 20px;
  --radius-md: 16px;
  --shadow-soft: 0 6px 24px rgba(0, 0, 0, 0.08);
  --shadow-hover: 0 12px 36px rgba(105, 64, 238, 0.18);
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

/* ===== DASHBOARD CARD ===== */
.dashboard-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-soft);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: var(--shadow-soft);
}

.dashboard-title {
  font-weight: 600;
  font-size: 1.2rem;
}
.dashboard-description {
  font-size: 0.95rem;
  color: var(--text-muted);
}

.dashboard-files {
  display: flex;
  gap: 12px;
}
.dashboard-files a {
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  padding: 6px 12px;
  border-radius: var(--radius-md);
  color: var(--primary);
  font-weight: 500;
  transition:
    background 0.2s,
    border-color 0.2s;
}
.dashboard-files a:hover {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
  color: #fff;
}

/* ===== TASK BLOCK ===== */
.task-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.task-label,
.comment-label {
  font-weight: 600;
  font-size: 0.95rem;
}
.answer-area,
.comment-area {
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  min-height: 80px;
  background: var(--bg-card);
  resize: vertical;
  outline: none;
}

.send-btn {
  background: var(--primary);
  color: #fff;
  padding: 10px 18px;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  align-self: flex-start;
}
.send-btn:hover {
  background: var(--primary-hover);
}

.date-row,
.status-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--text-muted);
}
.status-value {
  font-weight: 600;
  color: var(--text-main);
}

/* ===== ADAPTIVE ===== */
@media (max-width: 1024px) {
  .dashboard-files {
    flex-wrap: wrap;
  }
}

@media (max-width: 700px) {
  .container {
    padding: 0 16px;
  }
  .header-container {
    flex-direction: column;
    gap: 12px;
  }
  .header-right {
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 10px;
  }
}
</style>