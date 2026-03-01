module.exports = function(role) {
    return function(req, res, next) {
        // Проверяем роль пользователя (из токена)
        if (!req.user) {
            return res.status(401).json({ message: 'Не авторизован' });
        }
        
        // Если роль не совпадает, запрещаем доступ
        if (req.user.role !== role) {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }
        
        next();
    }
}