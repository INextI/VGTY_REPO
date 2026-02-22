const sequelize = require('../config/db')
const {DataTypes} = require('sequelize')


const User = sequelize.define('user', {
    id: {type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4},
    login: {type: DataTypes.STRING, allowNull: false, unique: true},
    password_hash: {type: DataTypes.TEXT, allowNull: false},
    role_id: { type: DataTypes.UUID, allowNull: false },  
    is_active: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true},
    last_login: {type: DataTypes.DATE}
},{
    tableName: 'users',
    timestamps: true,
    updatedAt: false
})

module.exports = User