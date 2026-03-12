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
      <div class="users-management">
        <!-- Заголовок и кнопки действий -->
        <div class="page-header">
          <div class="header-content">
            <h1><i class="fas fa-users"></i> Управление пользователями</h1>
            <p class="page-subtitle">Всего пользователей: {{ filteredUsers.length }}</p>
          </div>
          <div class="header-actions">
            <router-link class="btn-primary" to="/admin/createUser">
              <i class="fas fa-user-plus"></i>
              Добавить пользователя
            </router-link>
            <button class="btn-secondary" @click="refreshUsers">
              <i class="fas fa-sync-alt"></i>
              Обновить
            </button>
          </div>
        </div>
        
        <!-- Фильтры и поиск -->
        <div class="filters-section">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input
              v-model="searchQuery"
              placeholder="Поиск по логину, имени, фамилии..."
              class="search-input"
            />
          </div>
          <div class="filter-controls">
            <div class="filter-group">
              <label><i class="fas fa-filter"></i> Роль:</label>
              <select v-model="selectedRole" class="filter-select">
                <option value="">Все роли</option>
                <option v-for="role in roles" :key="role.id" :value="role.id">
                  {{ role.code === 'student' ? 'Студент' :
                    role.code === 'teacher' ? 'Преподаватель' :
                    role.code === 'admin' ? 'Администратор' : role.name }}
                </option>
              </select>
            </div>
            <div class="filter-group">
              <label><i class="fas fa-toggle-on"></i> Статус:</label>
              <select v-model="selectedStatus" class="filter-select">
                <option value="">Все</option>
                <option value="active">Активные</option>
                <option value="inactive">Неактивные</option>
              </select>
            </div>
            <div class="filter-group">
              <label><i class="fas fa-sort"></i> Сортировка:</label>
              <select v-model="sortBy" class="filter-select">
                <option value="last_login">Последний вход</option>
                <option value="login">Логин</option>
                <option value="createdAt">Дата создания</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Таблица пользователей -->
        <div class="users-table-container">
          <div v-if="loading" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Загрузка пользователей...</span>
          </div>
          
          <div v-else-if="filteredUsers.length === 0" class="empty-state">
            <i class="fas fa-users-slash"></i>
            <h3>Пользователи не найдены</h3>
            <p>Попробуйте изменить параметры поиска или добавьте нового пользователя</p>
          </div>

          <div v-else class="users-table-wrapper">
            <table class="users-table">
              <thead>
                <tr>
                  <th class="user-info-col">
                    <i class="fas fa-user"></i> Пользователь
                  </th>
                  <th class="role-col">
                    <i class="fas fa-user-tag"></i> Роль
                  </th>
                  <th class="status-col">
                    <i class="fas fa-circle"></i> Статус
                  </th>
                  <th class="last-login-col">
                    <i class="fas fa-sign-in-alt"></i> Последний вход
                  </th>
                  <th class="created-col">
                    <i class="fas fa-calendar-plus"></i> Создан
                  </th>
                  <th class="actions-col">
                    <i class="fas fa-cog"></i> Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in paginatedUsers" :key="user.id" class="user-row">
                  <td class="user-info-cell">
                    <div class="user-avatar-small" :class="getRoleClass(user.role_id)">
                      <i :class="getRoleIcon(user.role_id)"></i>
                    </div>
                    <div class="user-details">
                      <div class="user-login">{{ user.login }}</div>
                      <div class="user-name" v-if="user.student || user.employee">
                        {{ getUserFullName(user) }}
                      </div>
                      <div v-else class="user-name-missing">
                        <i class="fas fa-exclamation-circle"></i> Данные не заполнены
                      </div>
                    </div>
                  </td>
                  <td class="role-cell">
                    <span class="role-badge" :class="getRoleClass(user.role_id)">
                      {{ getRoleName(user.role_id) }}
                    </span>
                  </td>
                  <td class="status-cell">
                    <div class="status-indicator" :class="{ 'active': user.is_active }">
                      <span class="status-dot"></span>
                      <span class="status-text">
                        {{ user.is_active ? 'Активен' : 'Неактивен' }}
                      </span>
                    </div>
                  </td>
                  <td class="last-login-cell">
                    <div v-if="user.last_login" class="login-time">
                      <i class="fas fa-clock"></i>
                      {{ formatDate(user.last_login) }}
                    </div>
                    <div v-else class="no-login">
                      <i class="fas fa-times-circle"></i>
                      Никогда не входил
                    </div>
                  </td>
                  <td class="created-cell">
                    <div class="created-time">
                      <i class="fas fa-calendar"></i>
                      {{ formatDate(user.createdAt) }}
                    </div>
                  </td>
                  <td class="actions-cell">
                    <div class="action-buttons">
                      <button 
                        class="action-btn view-btn" 
                        @click="viewUserDetails(user)"
                        title="Просмотреть"
                      >
                        <i class="fas fa-eye"></i>
                      </button>
                      <button 
                        class="action-btn edit-btn" 
                        @click="editUser(user)"
                        title="Редактировать"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button 
                        class="action-btn toggle-btn" 
                        @click="toggleUserStatus(user)"
                        :title="user.is_active ? 'Деактивировать' : 'Активировать'"
                      >
                        <i :class="user.is_active ? 'fas fa-toggle-on' : 'fas fa-toggle-off'"></i>
                      </button>
                      <button 
                        class="action-btn delete-btn" 
                        @click="confirmDeleteUser(user)"
                        title="Удалить"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Пагинация -->
          <div v-if="filteredUsers.length > itemsPerPage" class="pagination">
            <button 
              class="pagination-btn" 
              @click="prevPage" 
              :disabled="currentPage === 1"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            
            <div class="page-numbers">
              <span 
                v-for="page in totalPages" 
                :key="page"
                class="page-number"
                :class="{ 'active': page === currentPage }"
                @click="goToPage(page)"
              >
                {{ page }}
              </span>
            </div>
            
            <button 
              class="pagination-btn" 
              @click="nextPage" 
              :disabled="currentPage === totalPages"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
            
            <div class="page-info">
              Показано {{ startIndex + 1 }}-{{ endIndex }} из {{ filteredUsers.length }}
            </div>
          </div>
        </div>

        <!-- Статистика -->
        <div class="stats-section">
          <div class="stat-card">
            <div class="stat-icon student">
              <i class="fas fa-graduation-cap"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.students }}</div>
              <div class="stat-label">Студентов</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon teacher">
              <i class="fas fa-chalkboard-teacher"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.teachers }}</div>
              <div class="stat-label">Преподавателей</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon active">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.active }}</div>
              <div class="stat-label">Активных</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon inactive">
              <i class="fas fa-times-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.inactive }}</div>
              <div class="stat-label">Неактивных</div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Модальное окно подтверждения удаления -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3><i class="fas fa-exclamation-triangle"></i> Подтверждение удаления</h3>
          <button class="modal-close" @click="showDeleteModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Вы уверены, что хотите удалить пользователя <strong>{{ userToDelete?.login }}</strong>?</p>
          <p class="warning-text">
            <i class="fas fa-exclamation-circle"></i>
            Это действие нельзя отменить. Все связанные данные будут удалены.
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showDeleteModal = false">
            Отмена
          </button>
          <button class="btn-danger" @click="deleteUser">
            <i class="fas fa-trash"></i>
            Удалить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import $api from '@/api';

// Данные
const users = ref([]);
const roles = ref([]); // Массив для хранения ролей из БД
const loading = ref(true);
const rolesLoading = ref(false);
const searchQuery = ref('');
const selectedRole = ref('');
const selectedStatus = ref('');
const sortBy = ref('last_login');
const currentPage = ref(1);
const itemsPerPage = 10;
const showDeleteModal = ref(false);
const userToDelete = ref(null);

// Статистика
const stats = ref({
  students: 0,
  teachers: 0,
  active: 0,
  inactive: 0
});

// Загрузка ролей из БД
const fetchRoles = async () => {
  rolesLoading.value = true;
  try {
    const response = await $api.get('/role'); // Эндпоинт для получения ролей
    roles.value = response.data;
    console.log('Роли загружены:', roles.value);
  } catch (error) {
    console.error('Ошибка загрузки ролей:', error);
    // Запасные данные на случай ошибки
   roles.value = [
  { id: 'd16ae680-9579-47b5-be61-7cf1ef9d1749', name: 'student', code: 'student' },
  { id: 'f77a7565-f9d8-4c15-859a-8248d5c395cc', name: 'teacher', code: 'teacher' },
  { id: 'f91847c6-d78d-4fc4-8204-fdc493142ee8', name: 'admin', code: 'admin' }
];
  } finally {
    rolesLoading.value = false;
  }
};

// Загрузка пользователей
const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await $api.get('/user');
    users.value = response.data;
    calculateStats();
  } catch (error) {
    console.error('Ошибка загрузки пользователей:', error);
    alert('Ошибка при загрузке пользователей');
  } finally {
    loading.value = false;
  }
};

// Карта соответствия UUID ролей → названия ролей
const roleMap = computed(() => {
  const map = {};
  roles.value.forEach(role => {
    map[role.id] = role.name;
  });
  return map;
});

// Карта соответствия UUID ролей → коды ролей
const roleCodeMap = computed(() => {
  const map = {};
  roles.value.forEach(role => {
    map[role.id] = role.code;
  });
  return map;
});

// Расчет статистики с учетом UUID ролей
const calculateStats = () => {
  // Находим UUID ролей
  const studentRole = roles.value.find(r => r.code === 'student');
  const teacherRole = roles.value.find(r => r.code === 'teacher');
  
  stats.value = {
    students: studentRole
      ? users.value.filter(u => u.role_id === studentRole.id).length
      : 0,
    teachers: teacherRole
      ? users.value.filter(u => u.role_id === teacherRole.id).length
      : 0,
    active: users.value.filter(u => u.is_active).length,
    inactive: users.value.filter(u => !u.is_active).length
  };
};


// Опции для фильтра по ролям
const roleOptions = computed(() => {
  return [
    { value: '', label: 'Все роли' },
    ...roles.value.map(role => ({
      value: role.id,
      label: role.name
    }))
  ];
});

// Фильтрация пользователей
const filteredUsers = computed(() => {
  let filtered = [...users.value];

  // Поиск
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(user =>
      user.login.toLowerCase().includes(query) ||
      (user.student && (
        user.student.first_name.toLowerCase().includes(query) ||
        user.student.last_name.toLowerCase().includes(query)
      )) ||
      (user.employee && (
        user.employee.first_name.toLowerCase().includes(query) ||
        user.employee.last_name.toLowerCase().includes(query)
      ))
    );
  }

  // Фильтр по роли (работает с UUID)
  if (selectedRole.value) {
    filtered = filtered.filter(user => user.role_id === selectedRole.value);
  }

  // Фильтр по статусу
  if (selectedStatus.value === 'active') {
    filtered = filtered.filter(user => user.is_active);
  } else if (selectedStatus.value === 'inactive') {
    filtered = filtered.filter(user => !user.is_active);
  }

  // Сортировка
  filtered.sort((a, b) => {
    if (sortBy.value === 'last_login') {
      return new Date(b.last_login || 0) - new Date(a.last_login || 0);
    } else if (sortBy.value === 'login') {
      return a.login.localeCompare(b.login);
    } else if (sortBy.value === 'createdAt') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return 0;
  });

  return filtered;
});

// Пагинация
const totalPages = computed(() =>
  Math.ceil(filteredUsers.value.length / itemsPerPage)
);

const startIndex = computed(() =>
  (currentPage.value - 1) * itemsPerPage
);

const endIndex = computed(() =>
  Math.min(startIndex.value + itemsPerPage, filteredUsers.value.length)
);

const paginatedUsers = computed(() =>
  filteredUsers.value.slice(startIndex.value, endIndex.value)
);

// Навигация по страницам
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

const goToPage = (page) => {
  currentPage.value = page;
};

// Вспомогательные функции
const getRoleName = (roleId) => {
  if (!roleId) return 'Без роли';
  
  // 1. Пробуем найти в карте ролей из БД
  if (roleMap.value[roleId]) {
    // Возвращаем русское название в зависимости от кода
    const role = roles.value.find(r => r.id === roleId);
    if (role) {
      const russianNames = {
        'student': 'Студент',
        'teacher': 'Преподаватель', 
        'admin': 'Администратор'
      };
      return russianNames[role.code] || role.name;
    }
  }
  
  // 2. Если роль не найдена, возвращаем сокращенный UUID
  if (roleId.includes('-')) {
    return `Роль: ${roleId.substring(0, 8)}...`;
  }
  
  return roleId;
};

const getRoleIcon = (roleId) => {
  if (!roleId) return 'fas fa-user';
  
  // Получаем код роли
  const roleCode = roleCodeMap.value[roleId] || roleId;
  
  const icons = {
    'student': 'fas fa-graduation-cap',
    'teacher': 'fas fa-chalkboard-teacher',
    'admin': 'fas fa-user-shield',
    'moderator': 'fas fa-user-cog'
  };
  
  return icons[roleCode] || 'fas fa-user';
};

const getRoleClass = (roleId) => {
  if (!roleId) return 'no-role';
  
  // Получаем код роли
  const roleCode = roleCodeMap.value[roleId] || roleId;
  
  const classes = {
    'student': 'student-role',
    'teacher': 'teacher-role',
    'admin': 'admin-role',
    'moderator': 'moderator-role'
  };
  
  return classes[roleCode] || 'unknown-role';
};

// Дополнительная функция для получения объекта роли
const getRoleObject = (roleId) => {
  if (!roleId) return null;
  return roles.value.find(role => role.id === roleId);
};

const getUserFullName = (user) => {
  if (user.student) {
    return `${user.student.last_name} ${user.student.first_name} ${user.student.patronymic || ''}`.trim();
  } else if (user.employee) {
    return `${user.employee.last_name} ${user.employee.first_name} ${user.employee.patronymic || ''}`.trim();
  }
  return 'Не указано';
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Действия с пользователями
const confirmDeleteUser = (user) => {
  userToDelete.value = user;
  showDeleteModal.value = true;
};

const deleteUser = async () => {
  if (!userToDelete.value) return;

  try {
    await $api.delete(`/user/${userToDelete.value.id}`);
    users.value = users.value.filter(u => u.id !== userToDelete.value.id);
    calculateStats();
    showDeleteModal.value = false;
    userToDelete.value = null;
  } catch (error) {
    console.error('Ошибка удаления пользователя:', error);
    alert('Ошибка при удалении пользователя');
  }
};

const toggleUserStatus = async (user) => {
  try {
    const newStatus = !user.is_active;
    await $api.patch(`/user/${user.id}/status`, { is_active: newStatus });
    user.is_active = newStatus;
    calculateStats();
  } catch (error) {
    console.error('Ошибка изменения статуса:', error);
    alert('Ошибка при изменении статуса пользователя');
  }
};

const viewUserDetails = (user) => {
  console.log('Просмотр пользователя:', user);
  const roleName = getRoleName(user.role_id);
  alert(`Детальная информация о пользователе ${user.login}\n\nИмя: ${getUserFullName(user)}\nРоль: ${roleName}\nСтатус: ${user.is_active ? 'Активен' : 'Неактивен'}`);
};

const editUser = (user) => {
  console.log('Редактирование пользователя:', user);
  alert(`Редактирование пользователя ${user.login}`);
};

const openCreateModal = () => {
  console.log('Открытие формы создания пользователя');
  alert('Открытие формы создания нового пользователя');
};

const refreshUsers = () => {
  fetchUsers();
  currentPage.value = 1;
};

// Заглушки для методов хедера
const toggleSearch = () => console.log('Поиск');
const toggleNotifications = () => console.log('Уведомления');
const openChat = () => console.log('Чат');
const userName = 'Администратор';
const unreadNotifications = 0;

// Загрузка данных при монтировании
onMounted(async () => {
  await fetchRoles(); // Сначала загружаем роли
  await fetchUsers(); // Затем загружаем пользователей
});

// Сброс пагинации при изменении фильтров
watch([searchQuery, selectedRole, selectedStatus], () => {
  currentPage.value = 1;
});
</script>


<style scoped>
/* ===== ОСНОВНЫЕ СТИЛИ ===== */
:root {
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --success: #10b981;
  --error: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
  --bg-card: #ffffff;
  --border-soft: #e5e7eb;
  --text-muted: #6b7280;
  --radius-md: 12px;
  --radius-sm: 8px;
  --shadow-soft: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-medium: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-large: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
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

.users-management {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ===== ЗАГОЛОВОК СТРАНИЦЫ ===== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 24px;
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-soft);
}

.header-content h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-content h1 i {
  color: var(--primary);
}

.page-subtitle {
  color: var(--text-muted);
  font-size: 16px;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-primary, .btn-secondary, .btn-danger {
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.3);
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

.btn-danger {
  background: var(--error);
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
}

/* ===== ФИЛЬТРЫ ===== */
.filters-section {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 20px;
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-soft);
}

.search-box {
  position: relative;
  margin-bottom: 20px;
}

.search-box i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 2px solid var(--border-soft);
  border-radius: var(--radius-sm);
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.filter-controls {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-group label i {
  color: var(--primary);
}

.filter-select {
  padding: 8px 12px;
  border: 2px solid var(--border-soft);
  border-radius: var(--radius-sm);
  font-size: 14px;
  background: white;
  cursor: pointer;
  min-width: 150px;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary);
}

/* ===== ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ ===== */
.users-table-container {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-soft);
  overflow: hidden;
  box-shadow: var(--shadow-medium);
}

.loading-state, .empty-state {
  padding: 60px 20px;
  text-align: center;
  color: var(--text-muted);
}

.loading-state i {
  font-size: 32px;
  margin-bottom: 16px;
  display: block;
}

.empty-state i {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
  display: block;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.empty-state p {
  color: var(--text-muted);
  max-width: 400px;
  margin: 0 auto;
}

.users-table-wrapper {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  background: #f9fafb;
  border-bottom: 2px solid var(--border-soft);
}

.users-table th {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  white-space: nowrap;
}

.users-table th i {
  margin-right: 8px;
  color: var(--primary);
}

.user-row {
  border-bottom: 1px solid var(--border-soft);
  transition: background-color 0.2s ease;
}

.user-row:hover {
  background-color: #f9fafb;
}

.users-table td {
  padding: 16px;
  vertical-align: middle;
}

/* Стили для ячеек */
.user-info-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 250px;
}

.user-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
}

.user-avatar-small.student-role {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.user-avatar-small.teacher-role {
  background: linear-gradient(135deg, #10b981 0%, #047857 100%);
}

.user-avatar-small.admin-role {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-login {
  font-weight: 600;
  color: #1f2937;
}

.user-name {
  font-size: 13px;
  color: var(--text-muted);
}

.user-name-missing {
  font-size: 12px;
  color: var(--warning);
  display: flex;
  align-items: center;
  gap: 4px;
}

.role-cell {
  min-width: 120px;
}

.role-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.role-badge.student-role {
  background: rgba(59, 130, 246, 0.1);
  color: #1d4ed8;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.role-badge.teacher-role {
  background: rgba(16, 185, 129, 0.1);
  color: #047857;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.role-badge.admin-role {
  background: rgba(139, 92, 246, 0.1);
  color: #7c3aed;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.status-cell {
  min-width: 120px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--error);
}

.status-indicator.active .status-dot {
  background: var(--success);
}

.status-text {
  font-size: 14px;
  color: #374151;
}

.last-login-cell, .created-cell {
  min-width: 180px;
}

.login-time, .created-time, .no-login {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.login-time i, .created-time i {
  color: var(--primary);
}

.no-login i {
  color: var(--error);
}

.no-login {
  color: var(--text-muted);
}

.actions-cell {
  min-width: 160px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ===== ПАГИНАЦИЯ ===== */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  margin-top: 24px;
  box-shadow: var(--shadow-soft);
  flex-wrap: wrap;
  gap: 16px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination-btn {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--border-soft);
  background: white;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 14px;
  font-weight: 600;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: #f3f4f6;
  border-color: #e5e7eb;
}

.pagination-btn:disabled:hover {
  transform: none;
  box-shadow: none;
  background: #f3f4f6;
  color: #374151;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 12px;
}

.page-number {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  background: white;
}

.page-number:hover:not(.active) {
  background: #f3f4f6;
  border-color: var(--border-soft);
  transform: translateY(-1px);
}

.page-number.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.2);
  transform: scale(1.05);
}

.page-number.active:hover {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

.page-info {
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 500;
  padding: 10px 16px;
  background: #f9fafb;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-soft);
  margin-left: auto;
}

/* ===== СТАТИСТИКА ===== */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-soft);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-medium);
  border-color: var(--primary);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), var(--primary-hover));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.stat-icon::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-icon:hover::after {
  opacity: 1;
}

.stat-icon.student {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.stat-icon.teacher {
  background: linear-gradient(135deg, #10b981 0%, #047857 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.stat-icon.active {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.stat-icon.inactive {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 8px;
  font-feature-settings: "tnum";
}

.stat-label {
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ===== МОДАЛЬНОЕ ОКНО ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(4px);
  }
}

.modal {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  width: 90%;
  max-width: 500px;
  box-shadow: var(--shadow-large);
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid var(--border-soft);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(to right, #fef2f2, #fff);
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-header h3 i {
  color: var(--warning);
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #f3f4f6;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--error);
  color: white;
  transform: rotate(90deg);
}

.modal-body {
  padding: 24px;
}

.modal-body p {
  margin: 0 0 16px 0;
  font-size: 15px;
  line-height: 1.6;
  color: #374151;
}

.modal-body p:last-child {
  margin-bottom: 0;
}

.warning-text {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-sm);
  padding: 16px;
  color: #991b1b;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.warning-text i {
  color: var(--error);
  flex-shrink: 0;
  margin-top: 2px;
}

.modal-footer {
  padding: 24px;
  border-top: 1px solid var(--border-soft);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #f9fafb;
}

/* ===== АДАПТИВНОСТЬ ===== */
@media (max-width: 768px) {
  .pagination {
    flex-direction: column;
    align-items: stretch;
    padding: 16px;
  }
  
  .pagination-controls {
    justify-content: center;
    order: 1;
  }
  
  .page-info {
    margin-left: 0;
    text-align: center;
    order: 2;
    width: 100%;
  }
  
  .page-numbers {
    display: none;
  }
  
  .mobile-pagination-info {
    display: block;
    text-align: center;
    font-size: 14px;
    color: var(--text-muted);
    margin: 8px 0;
    order: 3;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .stat-icon {
    width: 56px;
    height: 56px;
    font-size: 20px;
  }
  
  .stat-value {
    font-size: 28px;
  }
  
  .modal {
    width: 95%;
    margin: 16px;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .modal-footer button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .pagination-btn {
    width: 40px;
    height: 40px;
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 18px;
  }
  
  .stat-value {
    font-size: 24px;
  }
}

/* ===== ДОПОЛНИТЕЛЬНЫЕ ЭФФЕКТЫ ===== */
.stat-card .trend-indicator {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend-indicator.positive {
  background: rgba(16, 185, 129, 0.1);
  color: #047857;
}

.trend-indicator.negative {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

/* Анимация загрузки для статистики */
.stat-card.loading .stat-value,
.stat-card.loading .stat-label {
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  min-height: 20px;
}

.stat-card.loading .stat-value {
  width: 60px;
  height: 32px;
}

.stat-card.loading .stat-label {
  width: 80px;
  height: 16px;
  margin-top: 8px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Эффект пульсации для активных элементов */
@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(79, 70, 229, 0);
  }
}

.stat-card.highlight {
  animation: pulse 2s infinite;
  border-color: var(--primary);
}

/* Плавные переходы для всех интерактивных элементов */
.pagination-btn,
.page-number,
.stat-card,
.modal-close,
.action-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Улучшенные тени при наведении */
.pagination-btn:hover:not(:disabled),
.page-number:hover:not(.active),
.stat-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
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