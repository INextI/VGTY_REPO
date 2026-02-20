const jwt = require('jsonwebtoken');
const tokenModel = require('../models/tokenModel')

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '30m'})
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '30d'})

        return {
            accessToken,
            refreshToken
        }
    }

    validateAccessToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_ACCESS_SECRET)
        } catch (e) {
            return null
        }
    }

    validateRefreshToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
        } catch (e) {
            return null
        }
    }

    async saveToken(userId, refreshToken) {
        const tokenData = await tokenModel.findOne( {where:{user_id: userId}} )

        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save()
        }

        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30)

        const token = await tokenModel.create({user_id: userId, refreshToken, expires_at: expiresAt})
        return token;
    }

    async removeToken(refreshToken) {
        return tokenModel.destroy({ where: { refreshToken } })
    }

    async findToken(refreshToken) {
        return tokenModel.findOne({ where: { refreshToken } })
    }
}

module.exports = new TokenService()