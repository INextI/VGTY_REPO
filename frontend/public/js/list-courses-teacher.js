const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('id'); // Предполагается ссылка вида courses_teacher.html?id=1
const token = localStorage.getItem('token');

// Загрузка данных курса
async function loadCourseData() {
    const res = await fetch(`/api/disciplines/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    document.getElementById('displayCourseTitle').textContent = data.name;
}

// Удаление курса
document.getElementById('deleteBtn').addEventListener('click', async () => {
    if (!confirm('Вы уверены, что хотите удалить этот курс?')) return;

    const res = await fetch(`/api/disciplines/${courseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
        alert('Курс удален');
        window.location.href = 'home_teacher.html';
    }
});

loadCourseData();
