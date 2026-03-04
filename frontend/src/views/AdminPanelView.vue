<template>
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
  
  <main class="container">
  <div>
    <h1>Создать пользователя</h1>
    <form @submit.prevent="handleCreateUser">
      <input v-model="formData.login" placeholder="Логин" required />
      <input v-model="formData.password" type="password" placeholder="Пароль" required />
      
      <select v-model="formData.role">
        <option value="student">Студент</option>
        <option value="teacher">Преподаватель</option>
      </select>

      <!-- Доп. поля для студента -->
      <div v-if="formData.role === 'student'">
        <input v-model="formData.group_id" placeholder="ID группы" />
      </div>

      <button type="submit">Создать</button>
    </form>
    <p v-if="message" :class="status">{{ message }}</p>
  </div>
  </main>
</template>

<script setup>
import { ref, reactive } from 'vue';
import $api from '@/api';

const message = ref('');
const status = ref('');
const formData = reactive({
  login: '',
  password: '',
  role: 'student',
  first_name: '',
  last_name: '',
  group_id: null
});

const handleCreateUser = async () => {
  try {
    // Используем эндпоинт /user/full, который создали в бэкенде
    const response = await $api.post('/user/full', formData);
    message.value = 'Пользователь успешно создан';
    status.value = 'success';
  } catch (e) {
    message.value = 'Ошибка: ' + e.response.data.message;
    status.value = 'error';
  }
};
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

</style>
