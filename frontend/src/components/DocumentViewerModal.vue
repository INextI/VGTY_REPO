<template>
  <div v-show="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ document?.name }}</h3>
        <button class="close-btn" @click="close">×</button>
      </div>
      <div class="modal-content">
        <!-- Информация о документе -->
        <div class="document-info">
          <div class="info-row">
            <span class="label">Тип документа:</span>
            <span class="value">{{ document?.document_type }}</span>
          </div>
          <div class="info-row">
            <span class="label">Количество замен:</span>
            <span class="value">{{ document?.matches || 0 }}</span>
          </div>
        </div>
        <!-- Предпросмотр с подсветкой -->
        <div class="document-preview">
          <h4>Предпросмотр с изменениями:</h4>
          <div class="preview-content" v-html="highlightedContent"></div>
        </div>
        <!-- Оригинальный текст -->
        <div class="original-text" v-if="originalContent">
          <h4>Оригинальный текст:</h4>
          <pre class="original-content">{{ originalContent }}</pre>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" @click="close">Закрыть</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

const props = defineProps({
  document: {
    type: Object,
    default: null
  },
  searchText: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close']);

const isOpen = ref(false);
const originalContent = ref('');

// Открываем модальное окно при получении документа
watch(() => props.document, (newDoc) => {
  if (newDoc) {
    isOpen.value = true;
    loadOriginalContent();
  } else {
    isOpen.value = false;
  }
}, { immediate: true });

const highlightedContent = computed(() => {
  if (!props.document?.preview || !props.searchText) {
    return props.document?.preview || '';
  }
  
  const searchRegex = new RegExp(`(${escapeRegExp(props.searchText)})`, 'gi');
  return props.document.preview.replace(
    searchRegex,
    '<mark class="highlight">$1</mark>'
  );
});

function escapeRegExp(string) {
   return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function close() {
  isOpen.value = false;
  setTimeout(() => {
    emit('close');
  }, 300);
}

// Загрузка оригинального контента документа
async function loadOriginalContent() {
  if (!props.document?.id) return;
  
  try {
    // Здесь должен быть API запрос для получения оригинального контента
    // originalContent.value = await api.get(`/documents/${props.document.id}/content`);
    
    // Временно используем preview как оригинальный контент
    originalContent.value = props.document.preview || '';
  } catch (error) {
    console.error('Ошибка при загрузке оригинального контента:', error);
  }
}
</script>


<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-container {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.close-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.modal-content {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.document-info {
  background-color: #f9fafb;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: 600;
  color: #374151;
  min-width: 150px;
}

.value {
  color: #6b7280;
}

.document-preview,
.original-text {
  margin-bottom: 20px;
}

.document-preview h4,
.original-text h4 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.preview-content {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
  white-space: pre-wrap;
  font-family: monospace;
  line-height: 1.5;
}

.highlight {
  background-color: #fef3c7;
  padding: 2px 4px;
  border-radius: 2px;
}

.original-content {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
  white-space: pre-wrap;
  font-family: monospace;
  line-height: 1.5;
  color: #6b7280;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.btn-secondary {
  padding: 8px 16px;
  background-color: #6b7280;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-secondary:hover {
  background-color: #4b5563;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
