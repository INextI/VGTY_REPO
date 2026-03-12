<template>
  <div class="app-container">
    <!-- Header -->
    <header>
      <div class="header-container">
        <div class="header-left">
          <div class="logo">
            <router-link to="/admin">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Vstu_logo.svg/640px-Vstu_logo.svg.png"
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
            <router-link to="/admin/profile" class="user-avatar">
              <i class="fas fa-user"></i>
            </router-link>
          </div>
        </div>
      </div>
    </header>
    
    <main class="container">
      <div class="form-wrapper">
        <div class="form-header">
          <h1><i class="fas fa-user-plus"></i> Создать нового пользователя</h1>
          <p class="form-subtitle">Заполните все обязательные поля для создания учетной записи</p>
        </div>
        <form @submit.prevent="handleCreateUser" class="user-form">
          <!-- Основная информация -->
          <div class="form-section">
            <h2><i class="fas fa-id-card"></i> Основная информация</h2>
            <div class="form-grid">
              <div class="form-group">
                <label for="login">
                  <i class="fas fa-user-circle"></i> Логин *
                  <span class="hint">Уникальное имя пользователя</span>
                </label>
                <input
                  id="login"
                  v-model="formData.login"
                  placeholder="Введите логин"
                  required
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="password">
                  <i class="fas fa-lock"></i> Пароль *
                  <span class="hint">Минимум 6 символов</span>
                </label>
                <input
                  id="password"
                  v-model="formData.password"
                  type="password"
                  placeholder="Введите пароль"
                  required
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="first_name">
                  <i class="fas fa-user"></i> Имя *
                </label>
                <input
                  id="first_name"
                  v-model="formData.first_name"
                  placeholder="Введите имя"
                  required
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="last_name">
                  <i class="fas fa-user"></i> Фамилия *
                </label>
                <input
                  id="last_name"
                  v-model="formData.last_name"
                  placeholder="Введите фамилию"
                  required
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="patronymic">
                  <i class="fas fa-user"></i> Отчество
                  <span class="hint">Необязательное поле</span>
                </label>
                <input
                  id="patronymic"
                  v-model="formData.patronymic"
                  placeholder="Введите отчество"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="birth_date">
                  <i class="fas fa-calendar"></i> Дата рождения
                  <span class="hint">Формат: ГГГГ-ММ-ДД</span>
                </label>
                <input
                  id="birth_date"
                  v-model="formData.birth_date"
                  type="date"
                  class="form-input"
                />
              </div>
            </div>
          </div>
          
          <!-- Роль пользователя -->
          <div class="form-section">
            <h2><i class="fas fa-user-tag"></i> Роль пользователя</h2>
            <div class="role-selector">
              <div
                v-for="role in availableRoles"
                :key="role.id"
                class="role-option"
                :class="{ 'active': formData.role_id === role.id }"
                @click="selectRole(role)"
              >
                <i :class="getRoleIcon(role.code)"></i>
                <span>{{ role.name }}</span>
              </div>
            </div>
          </div>
          
          <!-- Дополнительные поля для студента -->
          <div v-if="selectedRoleCode === 'student'" class="form-section">
            <h2><i class="fas fa-university"></i> Информация о студенте</h2>
            <div class="form-grid">
              <div class="form-group">
                <label for="group_id">
                  <i class="fas fa-users"></i> Группа *
                  <span class="hint">Выберите учебную группу</span>
                </label>
                <select
                  id="group_id"
                  v-model="formData.group_id"
                  required
                  class="form-select"
                  :disabled="groupsLoading"
                >
                  <option value="" disabled>Выберите группу</option>
                  <option v-for="group in groups" :key="group.id" :value="group.id">
                    {{ group.name }}
                  </option>
                </select>
                <div v-if="groupsLoading" class="loading-indicator">
                  <i class="fas fa-spinner fa-spin"></i> Загрузка групп...
                </div>
              </div>
              <div class="form-group">
                <label for="faculty_id">
                  <i class="fas fa-building"></i> Факультет *
                  <span class="hint">Выберите факультет</span>
                </label>
                <select
                  id="faculty_id"
                  v-model="formData.faculty_id"
                  required
                  class="form-select"
                  :disabled="facultiesLoading"
                >
                  <option value="" disabled>Выберите факультет</option>
                  <option v-for="faculty in faculties" :key="faculty.id" :value="faculty.id">
                    {{ faculty.name }}
                  </option>
                </select>
                <div v-if="facultiesLoading" class="loading-indicator">
                  <i class="fas fa-spinner fa-spin"></i> Загрузка факультетов...
                </div>
              </div>
              <div class="form-group">
                <label for="education_form_id">
                  <i class="fas fa-book-open"></i> Форма обучения *
                  <span class="hint">Выберите форму обучения</span>
                </label>
                <select
                  id="education_form_id"
                  v-model="formData.education_form_id"
                  required
                  class="form-select"
                  :disabled="educationFormsLoading"
                >
                  <option value="" disabled>Выберите форму обучения</option>
                  <option v-for="form in educationForms" :key="form.id" :value="form.id">
                    {{ form.name }}
                  </option>
                </select>
                <div v-if="educationFormsLoading" class="loading-indicator">
                  <i class="fas fa-spinner fa-spin"></i> Загрузка форм обучения...
                </div>
              </div>
            </div>
          </div>
          
          <!-- Дополнительные поля для преподавателя -->
          <div v-if="selectedRoleCode === 'teacher'" class="form-section">
            <h2><i class="fas fa-chalkboard-teacher"></i> Информация о преподавателе</h2>
            <div class="form-grid">
              <div class="form-group">
                <label for="faculty_id_teacher">
                  <i class="fas fa-building"></i> Факультет
                  <span class="hint">Выберите факультет (необязательно)</span>
                </label>
                <select
                  id="faculty_id_teacher"
                  v-model="formData.faculty_id"
                  class="form-select"
                  :disabled="facultiesLoading"
                >
                  <option value="">Не выбран</option>
                  <option v-for="faculty in faculties" :key="faculty.id" :value="faculty.id">
                    {{ faculty.name }}
                  </option>
                </select>
                <div v-if="facultiesLoading" class="loading-indicator">
                  <i class="fas fa-spinner fa-spin"></i> Загрузка факультетов...
                </div>
              </div>
              <div class="form-group">
                <label for="grade_id">
                  <i class="fas fa-award"></i> Ученое звание
                  <span class="hint">Выберите ученое звание</span>
                </label>
                <select
                  id="grade_id"
                  v-model="formData.grade_id"
                  class="form-select"
                  :disabled="gradesLoading"
                >
                  <option value="">Не выбрано</option>
                  <option v-for="grade in grades" :key="grade.id" :value="grade.id">
                    {{ grade.name }}
                  </option>
                </select>
                <div v-if="gradesLoading" class="loading-indicator">
                  <i class="fas fa-spinner fa-spin"></i> Загрузка ученых званий...
                </div>
              </div>
            </div>
          </div>
          
          <!-- Сообщения об ошибках/успехе -->
          <div v-if="message" class="message" :class="status">
            <i :class="statusIcon"></i>
            <span>{{ message }}</span>
          </div>
          
          <!-- Кнопки формы -->
          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              <i class="fas fa-plus-circle"></i>
              {{ isSubmitting ? 'Создание...' : 'Создать пользователя' }}
            </button>
            <button type="button" class="btn-secondary" @click="resetForm">
              <i class="fas fa-redo"></i>
              Очистить форму
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import $api from '@/api';

const message = ref('');
const status = ref('');
const isSubmitting = ref(false);
const roles = ref([]);
const rolesLoading = ref(false);

// Данные для фильтров
const groups = ref([]);
const groupsLoading = ref(false);
const faculties = ref([]);
const facultiesLoading = ref(false);
const educationForms = ref([]);
const educationFormsLoading = ref(false);
const grades = ref([]);
const gradesLoading = ref(false);

// Данные формы
const formData = reactive({
  login: '',
  password: '',
  role_id: null,
  first_name: '',
  last_name: '',
  patronymic: '',
  birth_date: '',
  // Поля для студента
  group_id: '',
  faculty_id: '',
  education_form_id: '',
  // Поля для преподавателя
  grade_id: ''
});

// Иконка для сообщения
const statusIcon = computed(() => {
  return status.value === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
});

// Выбранный код роли
const selectedRoleCode = computed(() => {
  const role = roles.value.find(r => r.id === formData.role_id);
  return role ? role.code : '';
});

// Доступные роли для выбора
const availableRoles = computed(() => {
  return roles.value.filter(role => ['student', 'teacher'].includes(role.code));
});

// Иконка для роли
const getRoleIcon = (roleCode) => {
  const icons = {
    'student': 'fas fa-graduation-cap',
    'teacher': 'fas fa-chalkboard-teacher',
    'admin': 'fas fa-user-shield',
    'moderator': 'fas fa-user-cog'
  };
  return icons[roleCode] || 'fas fa-user';
};

// Выбор роли
const selectRole = (role) => {
  formData.role_id = role.id;
};

// Загрузка ролей из БД
const fetchRoles = async () => {
  rolesLoading.value = true;
  try {
    const response = await $api.get('/role');
    roles.value = response.data;
    console.log('Роли загружены:', roles.value);

    // Устанавливаем роль по умолчанию (студент)
    const defaultRole = roles.value.find(r => r.code === 'student');
    if (defaultRole) {
      formData.role_id = defaultRole.id;
    }
  } catch (error) {
    console.error('Ошибка загрузки ролей:', error);
    
    // Используем реальные UUID вместо строковых идентификаторов
    roles.value = [
      { id: 'd16ae680-9579-47b5-be61-7cf1ef9d1749', name: 'Студент', code: 'student' },
      { id: 'f77a7565-f9d8-4c15-859a-8248d5c395cc', name: 'Преподаватель', code: 'teacher' },
      { id: 'f91847c6-d78d-4fc4-8204-fdc493142ee8', name: 'Администратор', code: 'admin' }
    ];

    // Устанавливаем роль по умолчанию
    const defaultRole = roles.value.find(r => r.code === 'student');
    if (defaultRole) {
      formData.role_id = defaultRole.id;
    }
  } finally {
    rolesLoading.value = false;
  }
};


// Загрузка групп из БД
const fetchGroups = async () => {
  groupsLoading.value = true;
  try {
    const response = await $api.get('/group');
    groups.value = response.data;
    console.log('Группы загружены:', groups.value);
  } catch (error) {
    console.error('Ошибка загрузки групп:', error);
    message.value = '❌ Ошибка загрузки списка групп';
    status.value = 'error';
  } finally {
    groupsLoading.value = false;
  }
};

// Загрузка факультетов из БД
const fetchFaculties = async () => {
  facultiesLoading.value = true;
  try {
    const response = await $api.get('/faculty');
    faculties.value = response.data;
    console.log('Факультеты загружены:', faculties.value);
  } catch (error) {
    console.error('Ошибка загрузки факультетов:', error);
    message.value = '❌ Ошибка загрузки списка факультетов';
    status.value = 'error';
  } finally {
    facultiesLoading.value = false;
  }
};

// Загрузка форм обучения из БД
const fetchEducationForms = async () => {
  educationFormsLoading.value = true;
  try {
    const response = await $api.get('/educationForm');
    educationForms.value = response.data;
    console.log('Формы обучения загружены:', educationForms.value);
  } catch (error) {
    console.error('Ошибка загрузки форм обучения:', error);
    message.value = '❌ Ошибка загрузки списка форм обучения';
    status.value = 'error';
  } finally {
    educationFormsLoading.value = false;
  }
};

// Загрузка ученых званий из БД
const fetchGrades = async () => {
  gradesLoading.value = true;
  try {
    const response = await $api.get('/employeeGrade');
    grades.value = response.data;
    console.log('Ученые звания загружены:', grades.value);
  } catch (error) {
    console.error('Ошибка загрузки ученых званий:', error);
    message.value = '❌ Ошибка загрузки списка ученых званий';
    status.value = 'error';
  } finally {
    gradesLoading.value = false;
  }
};

// Создание пользователя
const handleCreateUser = async () => {
  isSubmitting.value = true;
  message.value = '';
  status.value = '';
  
  try {
    // Валидация обязательных полей
    if (!formData.login || !formData.password || !formData.first_name || !formData.last_name) {
      throw new Error('Заполните все обязательные поля');
    }
    
    if (!formData.role_id) {
      throw new Error('Роль не выбрана');
    }
    
    // Получаем выбранную роль
    const selectedRole = roles.value.find(r => r.id === formData.role_id);
    if (!selectedRole) {
      throw new Error('Выбранная роль не найдена');
    }
    
    // Валидация для студента
    if (selectedRole.code === 'student') {
      if (!formData.group_id || !formData.faculty_id || !formData.education_form_id) {
        throw new Error('Для студента необходимо указать группу, факультет и форму обучения');
      }
    }
    
   const userData = {
login: formData.login,
password: formData.password,
role_id: formData.role_id,

first_name: formData.first_name,
last_name: formData.last_name,
patronymic: formData.patronymic || null,
birth_date: formData.birth_date || null
};
    
    // Добавляем специфичные поля в зависимости от роли
    if (selectedRole.code === 'student') {
      userData.group_id = formData.group_id;
      userData.faculty_id = formData.faculty_id;
      userData.education_form_id = formData.education_form_id;
    } else if (selectedRole.code === 'teacher') {
      userData.faculty_id = formData.faculty_id || null;
      userData.grade_id = formData.grade_id || null;
    }
    
    // Отправка данных
    const response = await $api.post('/user/full', userData);
    message.value = '✅ Пользователь успешно создан!';
    status.value = 'success';
    
    // Сброс формы через 2 секунды
    setTimeout(() => {
      resetForm();
      message.value = '';
    }, 2000);
  } catch (error) {
    console.error('Ошибка создания пользователя:', error);
    if (error.response?.data?.message) {
      message.value = `❌ Ошибка: ${error.response.data.message}`;
    } else if (error.message) {
      message.value = `❌ Ошибка: ${error.message}`;
    } else {
      message.value = '❌ Произошла неизвестная ошибка';
    }
    status.value = 'error';
  } finally {
    isSubmitting.value = false;
  }
};

// Сброс формы
const resetForm = () => {
  Object.assign(formData, {
    login: '',
    password: '',
    role_id: roles.value.find(r => r.code === 'student')?.id || null,
    first_name: '',
    last_name: '',
    patronymic: '',
    birth_date: '',
    group_id: '',
    faculty_id: '',
    education_form_id: '',
    grade_id: ''
  });
};

// Загрузка всех данных при монтировании
onMounted(async () => {
  await fetchRoles();
  await fetchGroups();
  await fetchFaculties();
  await fetchEducationForms();
  await fetchGrades();
});

// Заглушки для методов хедера
const toggleSearch = () => console.log('Поиск');
const toggleNotifications = () => console.log('Уведомления');
const openChat = () => console.log('Чат');
const userName = 'Администратор';
const unreadNotifications = 0;
</script>

<style scoped>
/* ===== ОСНОВНЫЕ СТИЛИ ===== */
:root {
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --success: #10b981;
  --error: #ef4444;
  --warning: #f59e0b;
  --bg-card: #ffffff;
  --border-soft: #e5e7eb;
  --text-muted: #6b7280;
  --radius-md: 12px;
  --radius-sm: 8px;
  --shadow-soft: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-medium: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.app-container {
  min-height: 100vh;
  background: #f8fafc;
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
/* ===== ОСНОВНОЙ КОНТЕНТ ===== */
.container {
  max-width: 1180px;
  margin: 32px auto;
  padding: 0 32px;
}

.form-wrapper {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-soft);
  padding: 32px;
  box-shadow: var(--shadow-medium);
}

.form-header {
  margin-bottom: 32px;
  text-align: center;
}

.form-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.form-header h1 i {
  color: var(--primary);
}

.form-subtitle {
  color: var(--text-muted);
  font-size: 16px;
  margin: 0;
}

/* ===== ФОРМА ===== */
.user-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section {
  background: #f9fafb;
  border-radius: var(--radius-md);
  padding: 24px;
  border: 1px solid var(--border-soft);
}

.form-section h2 {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-section h2 i {
  color: var(--primary);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-group label i {
  color: var(--primary);
  width: 16px;
}

.hint {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 400;
  margin-left: auto;
}

.form-input,
.form-select {
  padding: 12px 16px;
  border: 2px solid var(--border-soft);
  border-radius: var(--radius-sm);
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 40px;
}

/* ===== ВЫБОР РОЛИ ===== */
.role-selector {
  display: flex;
  gap: 16px;
  margin-top: 12px;
}

.role-option {
  flex: 1;
  padding: 20px;
  border: 2px solid var(--border-soft);
  border-radius: var(--radius-md);
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.role-option:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
}

.role-option.active {
  border-color: var(--primary);
  background: rgba(79, 70, 229, 0.05);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
}

.role-option i {
  font-size: 32px;
  color: var(--text-muted);
}

.role-option.active i {
  color: var(--primary);
}

.role-option span {
  font-weight: 600;
  color: #374151;
}

/* ===== СООБЩЕНИЯ ===== */
.message {
  padding: 16px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

.message.success {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--success);
}

.message.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--error);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== КНОПКИ ===== */
.form-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 16px;
}

.btn-primary,
.btn-secondary {
  padding: 14px 28px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: none;
}

.btn-primary {
  background: var(--primary);
  color: white;
  min-width: 200px;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 2px solid var(--border-soft);
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-2px);
}

/* ===== АДАПТИВНОСТЬ ===== */
@media (max-width: 1024px) {
  .header-container,
  .container {
    padding: 0 24px;
  }
  .form-wrapper {
    padding: 24px;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
  .container {
    padding: 0 16px;
    margin: 24px auto;
  }
  .form-wrapper {
    padding: 20px;
  }
  .form-header h1 {
    font-size: 24px;
    flex-direction: column;
    gap: 8px;
  }
  .role-selector {
    flex-direction: column;
  }
  .form-actions {
    flex-direction: column;
  }
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .form-section {
    padding: 16px;
  }
  .form-header h1 {
    font-size: 22px;
  }
  .form-subtitle {
    font-size: 14px;
  }
}
</style>
