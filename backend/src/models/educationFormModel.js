const sequelize = require('../config/db')
const {DataTypes, UUIDV4} = require('sequelize')

const EducationForm = sequelize.define('education_form',{
    id: {type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4},
    name: {type: DataTypes.STRING, allowNull: false, unique: true}
},{
    tableName: 'education_forms',
    timestamps: false
})

module.exports = EducationForm

