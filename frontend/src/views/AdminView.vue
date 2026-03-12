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
    <div class="dashboard">
      <ul class="dashboard-list">
        <li><router-link class="dashboard-link" to="/admin/createUser">Создание пользователя</router-link></li>
        <li><router-link class="dashboard-link" to="/admin/users">Список пользователей</router-link></li>
        <li><router-link class="dashboard-link" to="/admin/uploadDocument">Добавить документ</router-link></li>
        <li><router-link class="dashboard-link" to="/admin/documentUpdate">Редактировать документы</router-link></li>
      </ul>
    </div>
  </main>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';
const auth = useAuthStore();
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

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: "Roboto", Arial, sans-serif;
  background: var(--bg-main);
  color: var(--text-main);
}

a { text-decoration: none; color: var(--primary); }
img { display: block; max-width: 100%; }

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

.dashboard-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dashboard-list li {
  margin-bottom: 12px;
}

.dashboard-link {
  display: inline-block;
  padding: 12px 16px;
  background: var(--primary);
  color: #fff;
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: background 0.2s;
}

.dashboard-link:hover {
  background: var(--primary-hover);
}

/* ===== ADAPTIVE ===== */
@media (max-width: 1024px) {
  .header-container {
    padding: 0 16px;
  }

  .container {
    padding: 0 16px;
  }

  .dashboard-link {
    width: 100%;
    text-align: center;
  }
}

@media (max-width: 700px) {
  .header-container {
    flex-direction: column;
    gap: 12px;
  }

  .header-right {
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .dashboard-link {
    padding: 10px 12px;
  }
}

.header-container { display: flex; justify-content: space-between; padding: 1rem; }
</style>