document.getElementById('saveCourseBtn').addEventListener('click', async () => {
    const title = document.getElementById('courseName').value;
    const description = document.getElementById('courseDesc').value;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('/api/disciplines', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, description })
        });

        if (response.ok) {
            alert('Курс успешно создан!');
            window.location.href = 'home_teacher.html';
        } else {
            const err = await response.json();
            alert('Ошибка: ' + err.message);
        }
    } catch (error) {
        console.error('Ошибка сети:', error);
    }
});
