const sequelize = require('../config/db')
const {DataTypes} = require('sequelize')

const TokenModel = sequelize.define('Token', {
    id: {type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4},
    user_id: {type: DataTypes.UUID, allowNull: false},
    refreshToken: {type: DataTypes.TEXT, allowNull: false},
    user_agent: {type: DataTypes.STRING},
    ip_addres: {type: DataTypes.STRING},
    expires_at: {type: DataTypes.DATE, allowNull: false}
}, {
    tableName: 'tokens',
    timestamps: false
})

module.exports = TokenModel