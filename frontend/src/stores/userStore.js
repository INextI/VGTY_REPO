import { defineStore } from 'pinia';
import $api from '@/api';

export const useUserStore = defineStore('user', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        isAuth: !!localStorage.getItem('token'),
    }),
    actions: {
        async login(login, password) {
            try {
                const response = await $api.post('/auth/login', { login, password });
                localStorage.setItem('token', response.data.accessToken);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                this.user = response.data.user;
                this.isAuth = true;
                return response.data.user;
            } catch (e) {
                throw e.response.data.message;
            }
        },
        async logout() {
    try {
        await $api.post('/auth/logout'); // Отправляем куку refreshToken на сервер
    } catch (e) {
        console.error("Ошибка при выходе из системы");
    } finally {
        this.user = null;
        this.isAuth = false;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    }
}
    }
});
