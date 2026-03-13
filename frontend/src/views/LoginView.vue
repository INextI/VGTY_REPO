<template>
  <div class="lv-login-page">
    <!-- Фон -->
    <div class="lv-background"></div>
    
    <!-- Основной контейнер -->
    <div class="lv-login-container">
      <div class="lv-login-box">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Vstu_logo.svg/640px-Vstu_logo.svg.png" alt="ВГТУ" class="lv-logo">
        
        <form @submit.prevent="handleLogin">
          <div class="lv-input-group">
            <input 
              v-model="login" 
              type="text" 
              placeholder="Логин" 
              required
              autocomplete="username"
            >
            <span class="lv-input-icon">👤</span>
          </div>
          
          <div class="lv-input-group">
            <input 
              v-model="password" 
              :type="showPassword ? 'text' : 'password'" 
              placeholder="Пароль" 
              required
              autocomplete="current-password"
            >
            <span 
              class="lv-input-icon password-toggle"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '🙈' : '👁️' }}
            </span>
          </div>
          
          <button type="submit">Вход</button>
          
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </form>
      </div>
    </div>
    
    <!-- Футер -->
    <footer>
      <div class="lv-footer-content">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Vstu_logo.svg/640px-Vstu_logo.svg.png" class="footer-logo">
        <div class="lv-footer-text">
          ВОРОНЕЖСКИЙ ГОСУДАРСТВЕННЫЙ<br>ТЕХНИЧЕСКИЙ УНИВЕРСИТЕТ
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

const login = ref('');
const password = ref('');
const showPassword = ref(false);
const error = ref('');

const auth = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  try {
    error.value = '';
    console.log('Попытка входа...', login.value); // Для отладки
    
    const user = await auth.login(login.value, password.value);
    console.log('Данные пользователя получены:', user);

    if (!user || !user.role) {
      throw new Error('Роль пользователя не определена');
    }

    // Редирект на основе роли
    if (user.role === 'admin') {
      router.push('/admin');
    } else if (user.role === 'student') {
      router.push('/student/home');
    } else if (user.role === 'employee') {
      router.push('/teacher/home');
    } else {
      router.push('/');
    }
  } catch (err) {
    
    error.value = err.response?.data?.message || err.message || 'Ошибка сети или сервера';
    console.error('Детали ошибки:', err.response?.data || err);
  }
};
</script>

<style>

/* ===== Background ===== */
.lv-background {
    background:
        linear-gradient(to right, rgba(105,64,238,0.25), rgba(255,255,255,0.35)),
        url('https://cchgeu.ru/upload/resize_cache/iblock/19c/5nzxpiukzw6wx11r2fira17rti9prvev/1200_1200_1/Fv2ykckoWd4.jpg')
        center / cover no-repeat;
    position: fixed;
    inset: 0;
    z-index: -1;
}

.lv-login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    min-height: calc(100vh - 90px);
}

.lv-login-box {
    background: rgba(255,255,255,0.95);
    border-radius: 26px;
    box-shadow: 
        0 20px 60px rgba(0,0,0,0.18),
        0 2px 8px rgba(0,0,0,0.08);
    padding: 44px 48px 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 28px;
}

.lv-logo {
    width: 120px;
    padding: 14px;
    padding-top: 0px;
}

/* ===== Form ===== */
form {
    width: 100%;
}

.lv-input-group {
    display: flex;
    align-items: center;
    border-radius: 14px;
    background: #f4f5f8;
    padding: 0 14px;
    margin-bottom: 18px;
    transition: box-shadow 0.2s, background 0.2s;
}

.lv-input-group:focus-within {
    background: #fff;
    box-shadow: 0 0 0 2px rgba(105,64,238,0.35);
}

.lv-input-group input {
    border: none;
    outline: none;
    padding: 15px 6px;
    font-size: 16px;
    flex: 1;
    background: none;
}

.lv-input-icon {
    font-size: 18px;
    color: #a5a5a5;
    cursor: pointer;
}

button[type="submit"] {
    width: 100%;
    margin-top: 16px;

    background: #6940EE;
    border: none;
    border-radius: 18px;

    padding: 14px 0;
    font-size: 18px;
    font-weight: 600;

    cursor: pointer;
    transition: background 0.2s, transform 0.15s, box-shadow 0.15s;
    box-shadow: 0 8px 22px rgba(105,64,238,0.35);
}
button[type="submit"]:hover {
    background: #4C2CB8;
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(105,64,238,0.45);
}

button[type="submit"] a {
    color: #fff;
    text-decoration: none;
    display: block;
}

/* ===== Footer ===== */

lv-footer {
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    background: #232A3F;
    color: #ffd374;
    padding: 18px 16px;
}

.lv-footer-content {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 18px;
}

.lv-footer-logo {
    width: 40px;
}

.lv-footer-text {
    font-size: 14px;
    line-height: 1.3;
    font-weight: 700;
    letter-spacing: 0.6px;
    text-align: center;
}

.lv-footer-icons span {
    background: #39405b;
    padding: 9px 14px;
    border-radius: 10px;
    font-size: 18px;

    cursor: pointer;
    transition:
        background 0.2s,
        transform 0.15s,
        box-shadow 0.15s;
}

.lv-footer-icons span:hover {
    background: #4C2CB8;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(76,44,184,0.45);
}

/* ===== Adaptive ===== */
@media (max-width: 480px) {
    .lv-footer-text {
        min-width: 100%;
        padding: 36px 28px;
        border-radius: 22px;
    }

    .logo {
        width: 64px;
    }

    button[type="submit"] {
        font-size: 16px;
    }

    .footer-text {
        font-size: 13px;
    }
}
</style>
