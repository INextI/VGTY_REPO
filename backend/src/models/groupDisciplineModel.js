const sequelize = require('../config/db')
const {DataTypes} = require('sequelize')

const GroupDiscipline = sequelize.define('GroupDiscipline', {
    group_id: {type: DataTypes.UUID, primaryKey: true},
    discipline_id: {type: DataTypes.UUID, primaryKey: true}
}, {
    tableName: 'group_disciplines',
    timestamps: false
});

module.exports = GroupDiscipline;
