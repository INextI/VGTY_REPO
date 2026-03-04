import { defineStore } from 'pinia';
import $api from '@/api';
import router from '@/router';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        isAuth: !!localStorage.getItem('token'),
    }),
    actions: {
        async login(login, password) {
            const response = await $api.post('/auth/login', { login, password });
            localStorage.setItem('token', response.data.accessToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            this.user = response.data.user;
            this.isAuth = true;
            return response.data.user;
        },
        async logout() {
            try { await $api.post('/auth/logout'); } finally {
                this.user = null;
                this.isAuth = false;
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                router.push('/auth/login');
            }
        }
    }
});
