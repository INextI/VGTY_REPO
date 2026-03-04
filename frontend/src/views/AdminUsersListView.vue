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
  <div class="admin-container">
    <h2>Список пользователей</h2>
    <table v-if="users.length">
      <thead>
        <tr>
          <th>Логин</th>
          <th>Роль</th>
          <th>Последний вход</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.login }}</td>
          <td>{{ user.role_id }}</td>
          <td>{{ new Date(user.last_login).toLocaleString() }}</td>
          <td>
            <button @click="deleteUser(user.id)">Удалить</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>Загрузка...</p>
  </div>

  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import $api from '@/api';

const users = ref([]);

const fetchUsers = async () => {
  try {
    const response = await $api.get('/user'); // Роут userRoute.js
    users.value = response.data;
  } catch (e) {
    alert('Ошибка при загрузке пользователей');
  }
};

const deleteUser = async (id) => {
  if (confirm('Удалить пользователя?')) {
    await $api.delete(`/user/${id}`);
    users.value = users.value.filter(u => u.id !== id);
  }
};

onMounted(fetchUsers);
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
