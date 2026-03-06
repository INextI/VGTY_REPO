const sequelize = require('../config/db')
const {DataTypes} = require('sequelize')

const Discipline = sequelize.define('discipline',{
    id: {type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4},
    name: {type: DataTypes.STRING, allowNull: false},
    owner_employee_id: {type: DataTypes.UUID},
    description: {type: DataTypes.TEXT},
    image_url: {type: DataTypes.STRING},
    education_form_id: {type: DataTypes.UUID, allowNull: false}
},{
    tableName: 'disciplines',
    timestamps: true,
    updatedAt: false
})

module.exports = Discipline