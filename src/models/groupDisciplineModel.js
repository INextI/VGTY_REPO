const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const GroupDiscipline = sequelize.define('GroupDiscipline', {
    // В Sequelize для составного ключа мы просто указываем primaryKey: true для всех полей, входящих в него.
    group_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    discipline_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    }
}, {
    tableName: 'group_disciplines',
    timestamps: false
});

module.exports = GroupDiscipline;
