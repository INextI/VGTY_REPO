import axios from 'axios';

const $api = axios.create({
    withCredentials: true,
    baseURL: 'http://localhost:5000/api'
});

$api.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    return config;
});

$api.interceptors.response.use((config) => config, async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._isRetry) {
        originalRequest._isRetry = true;
        try {
            const response = await axios.get('http://localhost:5000/api/auth/refresh', { withCredentials: true });
            localStorage.setItem('token', response.data.accessToken);
            return $api.request(originalRequest);
        } catch (e) {
            console.log('Пользователь не авторизован');
        }
    }
    throw error;
});

export default $api;



/*


import axios from 'axios';
import { useToast } from "vue-toastification";

const toast = useToast();

$api.interceptors.response.use((response) => response, (error) => {
    const message = error.response?.data?.message || "Произошла ошибка";
    
    if (error.response?.status === 403) {
        toast.error("У вас недостаточно прав");
    } else if (error.response?.status === 500) {
        toast.error("Ошибка на стороне сервера");
    } else {
        toast.warning(message);
    }
    
    return Promise.reject(error);
});

const $api = axios.create({
    withCredentials: true, //для передачи кук (refreshToken)
    baseURL: 'http://localhost:5000/api'
});

// Интерцептор запроса: добавляет Access Token в каждый заголовок
$api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Интерцептор ответа: обработка 401 ошибки (истек токен)
$api.interceptors.response.use((config) => {
    return config;
}, async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && error.config && !error.config._isRetry) {
        originalRequest._isRetry = true;
        try {
            // обновить токен через ваш эндпоинт /auth/refresh
            const response = await axios.get('http://localhost:5000/api/auth/refresh', { withCredentials: true });
            localStorage.setItem('token', response.data.accessToken);
            return $api.request(originalRequest);
        } catch (e) {
            console.log('Пользователь не авторизован');
        }
    }
    throw error;
});

export default $api;*/