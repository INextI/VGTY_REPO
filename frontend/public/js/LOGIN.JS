
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('form');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Отменяем стандартную отправку формы

        //  выбираем поля по их типу или уникальному атрибуту .
        // document.querySelector('input') всегда выбирает первый попавшийся input.
        const loginInput = document.querySelector('input[type="text"]');
        const passwordInput = document.querySelector('input[type="password"]');

        const data = {
            login: loginInput.value,
            password: passwordInput.value
        };

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.message || 'Ошибка входа');
                return;
            }

            // Сохраняем токен и данные пользователя для дальнейшего использования.
            localStorage.setItem('token', result.token);
            // Сохраняем информацию о пользователе, чтобы использовать на других страницах (например, для отображения имени)
            localStorage.setItem('user', JSON.stringify(result.user));


            //Перенаправляем пользователя в зависимости от его роли, полученной от сервера.
            switch (result.user.role) {
                case 'admin':
                    window.location.href = '/admin.html'; // Перенаправляем админа на его страницу
                    break;
                case 'teacher':
                    window.location.href = '/home_teacher.html';
                    break;
                case 'student':
                    window.location.href = '/home_student.html';
                    break;
                default:
                    // Если роль не определена, отправляем на главную или страницу входа
                    window.location.href = '/';
                    break;
            }

        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла сетевая ошибка. Попробуйте снова.');
        }
    });
});
