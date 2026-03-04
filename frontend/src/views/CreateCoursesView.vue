
<template>
  <div class="create-courses-page">
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
      <div class="main-section">
        <!-- Image Upload -->
        <div class="image-upload" @click="triggerImageUpload">
          <div v-if="!courseImage" class="upload-placeholder">
            <i class="fas fa-image"></i>
            <span>Добавить изображение курса</span>
            <span class="upload-hint">Рекомендуемый размер: 1200x600 px</span>
          </div>
          <div v-else class="image-preview">
            <img :src="courseImage" alt="Превью курса" class="preview-image">
            <button class="change-image-btn" @click.stop="triggerImageUpload">
              <i class="fas fa-exchange-alt"></i> Изменить
            </button>
            <button class="remove-image-btn" @click.stop="removeImage">
              <i class="fas fa-trash"></i>
            </button>
          </div>
          <input type="file" 
                 ref="imageInput" 
                 accept="image/*" 
                 style="display: none" 
                 @change="handleImageUpload">
        </div>

        <!-- Course Title Section -->
        <div class="course-title-section">
          <input v-model="courseName" 
                 class="course-title-input" 
                 type="text" 
                 placeholder="Название курса..."
                 maxlength="100">
          <div class="char-counter">{{ courseName.length }}/100</div>
          
          <button class="enroll-btn" @click="openEnrollmentSettings">
            <i class="fas fa-user-plus"></i> Настройка зачисления на курс
          </button>
        </div>
      </div>

      <!-- Course Description -->
      <div class="dashboard">
        <div class="dashboard-label">Описание курса</div>
        <textarea v-model="courseDescription" 
                  class="dashboard-desc-input" 
                  placeholder="Введите подробное описание курса..."
                  rows="6"
                  maxlength="2000"></textarea>
        <div class="char-counter">{{ courseDescription.length }}/2000</div>
        
        <!-- Course Details -->
        <div class="course-details">
          <div class="detail-group">
            <label for="courseCategory">
              <i class="fas fa-folder"></i> Категория
            </label>
            <select id="courseCategory" v-model="courseCategory" class="detail-input">
              <option value="" disabled selected>Выберите категорию</option>
              <option value="programming">Программирование</option>
              <option value="mathematics">Математика</option>
              <option value="physics">Физика</option>
              <option value="engineering">Инженерия</option>
              <option value="design">Дизайн</option>
              <option value="business">Бизнес</option>
            </select>
          </div>
          
          <div class="detail-group">
            <label for="courseDuration">
              <i class="fas fa-clock"></i> Продолжительность (недель)
            </label>
            <input id="courseDuration" 
                   v-model.number="courseDuration" 
                   type="number" 
                   min="1" 
                   max="52" 
                   class="detail-input"
                   placeholder="12">
          </div>
          
          <div class="detail-group">
            <label for="courseLevel">
              <i class="fas fa-signal"></i> Уровень сложности
            </label>
            <select id="courseLevel" v-model="courseLevel" class="detail-input">
              <option value="beginner">Начальный</option>
              <option value="intermediate">Средний</option>
              <option value="advanced">Продвинутый</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Course Modules (Optional) -->
      <div class="modules-section" v-if="showModules">
        <div class="modules-header">
          <h3><i class="fas fa-layer-group"></i> Модули курса</h3>
          <button class="add-module-btn" @click="addModule">
            <i class="fas fa-plus"></i> Добавить модуль
          </button>
        </div>
        
        <div class="modules-list">
          <div v-for="(module, index) in courseModules" 
               :key="index" 
               class="module-item">
            <div class="module-header">
              <input v-model="module.title" 
                     :placeholder="`Модуль ${index + 1}: Название`" 
                     class="module-title-input">
              <button class="remove-module-btn" @click="removeModule(index)">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <textarea v-model="module.description" 
                      :placeholder="`Описание модуля ${index + 1}`"
                      class="module-desc-input"
                      rows="2"></textarea>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="button-row">
        <button class="main-btn btn-cancel" @click="handleCancel">
          <i class="fas fa-times"></i> Отменить
        </button>
        
        <div class="button-group">
          <button v-if="showModules" 
                  class="main-btn btn-save-draft" 
                  @click="saveAsDraft">
            <i class="fas fa-save"></i> Сохранить черновик
          </button>
          
          <button class="main-btn btn-create" 
                  :disabled="!isFormValid || isCreating" 
                  @click="createCourse">
            <i class="fas fa-plus-circle"></i> 
            <span v-if="isCreating">Создание...</span>
            <span v-else>Создать курс</span>
          </button>
        </div>
      </div>

      <!-- Enrollment Settings Modal -->
      <div v-if="showEnrollmentModal" class="modal-overlay" @click="closeEnrollmentModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3><i class="fas fa-user-plus"></i> Настройка зачисления</h3>
            <button class="close-btn" @click="closeEnrollmentModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="enrollment-option">
              <input type="radio" 
                     id="enrollmentOpen" 
                     v-model="enrollmentType" 
                     value="open">
              <label for="enrollmentOpen">
                <strong>Открытая регистрация</strong>
                <p>Любой пользователь может присоединиться к курсу</p>
              </label>
            </div>
            
            <div class="enrollment-option">
              <input type="radio" 
                     id="enrollmentInvite" 
                     v-model="enrollmentType" 
                     value="invite">
              <label for="enrollmentInvite">
                <strong>По приглашению</strong>
                <p>Только приглашенные пользователи могут присоединиться</p>
              </label>
            </div>
            
            <div class="enrollment-option">
              <input type="radio" 
                     id="enrollmentCode" 
                     v-model="enrollmentType" 
                     value="code">
              <label for="enrollmentCode">
                <strong>По коду доступа</strong>
                <p>Пользователи могут присоединиться с помощью кода</p>
              </label>
            </div>
            
            <div v-if="enrollmentType === 'code'" class="enrollment-code-section">
              <label for="accessCode">Код доступа:</label>
              <div class="code-input-group">
                <input id="accessCode" 
                       v-model="accessCode" 
                       type="text" 
                       placeholder="Введите код (например: VSTU2024)"
                       class="code-input">
                <button class="generate-code-btn" @click="generateAccessCode">
                  <i class="fas fa-sync-alt"></i> Сгенерировать
                </button>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="modal-btn cancel" @click="closeEnrollmentModal">
              Отмена
            </button>
            <button class="modal-btn save" @click="saveEnrollmentSettings">
              Сохранить настройки
            </button>
          </div>
        </div>
      </div>

      <!-- Success Notification -->
      <div v-if="showSuccessMessage" class="success-notification">
        <i class="fas fa-check-circle"></i>
        <span>Курс успешно создан!</span>
        <button class="close-notification" @click="closeSuccessMessage">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

// Router
const router = useRouter();

// Reactive data
const imageInput = ref(null);
const courseName = ref('');
const courseDescription = ref('');
const courseImage = ref(null);
const courseCategory = ref('');
const courseDuration = ref(12);
const courseLevel = ref('beginner');
const showModules = ref(false);
const courseModules = ref();
const isCreating = ref(false);
const showEnrollmentModal = ref(false);
const enrollmentType = ref('open');
const accessCode = ref('');
const unreadNotifications = ref(2);
const showSuccessMessage = ref(false);

// Get user info
const authStore = useAuthStore();
const userName = computed(() => {
  return authStore.user?.name || 'Иван Иванов';
});

// Form validation
const isFormValid = computed(() => {
  return courseName.value.trim().length > 0 && 
         courseDescription.value.trim().length > 0 &&
         courseCategory.value !== '';
});

// Methods
const triggerImageUpload = () => {
  imageInput.value.click();
};

const handleImageUpload = (event) => {
  const file = event.target.files;
  if (file) {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Изображение слишком большое. Максимальный размер: 5MB');
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите файл изображения');
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      courseImage.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const removeImage = () => {
  courseImage.value = null;
  if (imageInput.value) {
    imageInput.value.value = '';
  }
};

const openEnrollmentSettings = () => {
  showEnrollmentModal.value = true;
};

const closeEnrollmentModal = () => {
  showEnrollmentModal.value = false;
};

const generateAccessCode = () => {
  // Generate random 8-character code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  accessCode.value = code;
};

const saveEnrollmentSettings = () => {
  console.log('Enrollment settings saved:', {
    type: enrollmentType.value,
    code: enrollmentType.value === 'code' ? accessCode.value : null
  });
  showEnrollmentModal.value = false;
};

const addModule = () => {
  courseModules.value.push({
    title: '',
    description: '',
    lessons:[] 
  });
  showModules.value = true;
};

const removeModule = (index) => {
  courseModules.value.splice(index, 1);
  if (courseModules.value.length === 0) {
    showModules.value = false;
  }
};

const handleCancel = () => {
  if (courseName.value.trim() || courseDescription.value.trim()) {
    const confirmCancel = confirm('У вас есть несохраненные изменения. Вы уверены, что хотите отменить?');
    if (!confirmCancel) return;
  }
  router.push('/teacher/home');
};

const saveAsDraft = async () => {
  const courseData = {
    name: courseName.value,
    description: courseDescription.value,
    image: courseImage.value,
    category: courseCategory.value,
    duration: courseDuration.value,
    level: courseLevel.value,
    modules: courseModules.value,
    enrollmentType: enrollmentType.value,
    accessCode: enrollmentType.value === 'code' ? accessCode.value : null,
    status: 'draft'
  };
  
  console.log('Saving draft:', courseData);
  
  // Here would be API call to save draft
  alert('Черновик курса сохранен!');
};

const createCourse = async () => {
  if (!isFormValid.value) {
    alert('Пожалуйста, заполните обязательные поля: название, описание и категория курса');
    return;
  }
  
  isCreating.value = true;
  
  try {
    const courseData = {
      name: courseName.value,
      description: courseDescription.value,
      image: courseImage.value,
      category: courseCategory.value,
      duration: courseDuration.value,
      level: courseLevel.value,
      modules: courseModules.value,
      enrollmentType: enrollmentType.value,
      accessCode: enrollmentType.value === 'code' ? accessCode.value : null,
      teacherId: authStore.user?.id,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    // Here would be API call to create course
    console.log('Creating course:', courseData);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Show success message
    showSuccessMessage.value = true;
    // В реальном приложении здесь был бы API вызов
    // await api.courses.create(courseData);
    
    // Показать сообщение об успехе
    showSuccessMessage.value = true;
    
    // Перенаправить на страницу курса через 2 секунды
    setTimeout(() => {
      router.push('/teacher/home');
    }, 2000);
    
  } catch (error) {
    console.error('Ошибка при создании курса:', error);
    alert('Произошла ошибка при создании курса. Пожалуйста, попробуйте снова.');
  } finally {
    isCreating.value = false;
  }
};

const closeSuccessMessage = () => {
  showSuccessMessage.value = false;
};

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

// При загрузке компонента
onMounted(() => {
  console.log('CreateCoursesView загружен');
  
  // Генерируем начальный код доступа
  generateAccessCode();
});
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
  color: inherit;
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

/* ===== MAIN SECTION ===== */
.main-section {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.image-upload {
  flex: 1 1 280px;
  min-height: 160px;
  border: 2px dashed var(--border-soft);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-muted);
  font-weight: 500;
  text-align: center;
  transition: border-color 0.2s, background 0.2s;
}

.image-upload:hover {
  border-color: var(--primary);
  background: #f5f5ff;
}

.course-title-section {
  flex: 2 1 400px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.course-title-input {
  padding: 12px 16px;
  font-size: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-soft);
  outline: none;
  width: 100%;
}

.course-title-input:focus {
  border-color: var(--primary);
}

.enroll-btn {
  background: var(--primary);
  color: #fff;
  padding: 10px 14px;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.enroll-btn:hover {
  background: var(--primary-hover);
}

/* ===== DASHBOARD DESCRIPTION ===== */
.dashboard {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-soft);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dashboard-label {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-main);
}

.dashboard-desc-input {
  width: 100%;
  min-height: 120px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-soft);
  padding: 10px 12px;
  font-size: 0.95rem;
  resize: vertical;
  outline: none;
}

.dashboard-desc-input:focus {
  border-color: var(--primary);
}

/* ===== BUTTON ROW ===== */
.button-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.main-btn {
  padding: 10px 18px;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-cancel {
  background: #fff;
  color: var(--primary);
  border: 1px solid var(--primary);
}

.btn-cancel:hover {
  background: #f5f5ff;
}

.btn-create {
  background: var(--primary);
  color: #fff;
}

.btn-create:hover {
  background: var(--primary-hover);
}

/* ===== ADAPTIVE ===== */
@media (max-width: 1024px) {
  .main-section {
    flex-direction: column;
  }
}

@media (max-width: 700px) {
  .container {
    padding: 0 16px;
  }
}

</style>