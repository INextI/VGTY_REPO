import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { 
    path: '/', 
    component: () => import('@/views/HomeView.vue'), 
    meta: { requiresAuth: false }
  },
  { 
    path: '/login', 
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  { 
    path: '/admin', 
    component: () => import('@/views/AdminView.vue'),
    meta: { requiresAuth: true, role: 'admin' } 
  },
  { 
    path: '/admin/users', 
    component: () => import('@/views/AdminUsersListView.vue'),
    meta: { requiresAuth: true, role: 'admin' } 
  },
  { 
    path: '/admin/createUser', 
    component: () => import('@/views/AdminPanelView.vue'),
    meta: { requiresAuth: true, role: 'admin' } 
  },
  { 
    path: '/student/home', 
    component: () => import('@/views/HomeStudentView.vue'),
    meta: { requiresAuth: true, role: 'student' } 
  }
  ,
  { 
    path: '/teacher/home', 
    component: () => import('@/views/HomeTeacherView.vue'),
    meta: { requiresAuth: true, role: 'teacher' } 
  },
  { 
    path: '/student/task', 
    component: () => import('@/views/TaskView.vue'),
    meta: { requiresAuth: true, role: 'student' } 
  },
  { 
    path: '/teacher/courses', 
    component: () => import('@/views/CourseTeacherView.vue'),
    meta: { requiresAuth: true, role: 'teacher' } 
  },
  { 
    path: '/student/courses', 
    component: () => import('@/views/CourseStudentView.vue'),
    meta: { requiresAuth: true, role: 'student' } 
  },
  { 
    path: '/teacher/createCourse', 
    component: () => import('@/views/CreateCoursesView.vue'),
    meta: { requiresAuth: true, role: 'teacher' } 
  },
  { 
    path: '/teacher/checkWorks', 
    component: () => import('@/views/CheckWorksView.vue'),
    meta: { requiresAuth: true, role: 'teacher' } 
  }

];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Глобальный guard
import { useAuthStore } from '@/stores/authStore';

// router.beforeEach((to, from, next) => {
//   const authStore = useAuthStore();
//   const token = localStorage.getItem('token');
  
//   if (to.meta.requiresAuth && !token) {
//     return next('/login');
//   }
  
//   if (to.meta.role && authStore.user?.role !== to.meta.role) {
//     alert('Доступ запрещен');
//     return next('/login');
//   }
  
//   next();
// });

export default router;

