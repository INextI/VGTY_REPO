const TokenService = require('../services/tokenService')

module.exports = function (req, res, next) {
    try {
        let token

        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Доступ запрещен. Токен не предоставлен.' });
        }

        token = authHeader.split(' ')[1]

        if (!token)
            return res.status(401).json({message: 'Не авторизован'})

        const userData = TokenService.validateAccessToken(token)

        if (!userData) {
            return res.status(401).json({message: 'Токен не действителен'})
        }

        req.user = userData
        next()
    } catch (e) {
        return res.status(401).json({ message: 'Не авторизован'})
    }
}