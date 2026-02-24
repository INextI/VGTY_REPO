const sequelize = require('../config/db')
const {DataTypes} = require('sequelize')

const Group = sequelize.define('group', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    edu_program_id: {type: DataTypes.UUID, allowNull: false},
    curator_id: {type: DataTypes.UUID},
    academic_year_id: {type: DataTypes.UUID, allowNull: false}
}, {
    tableName: 'groups',
    timestamps: false
});

module.exports = Group;
