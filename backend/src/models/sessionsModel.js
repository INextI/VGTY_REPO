const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');


const Session = sequelize.define('Session', {
    id: {
        type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4
    },
    discipline_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'disciplines',
            key: 'id'
        }
    },
    teacher_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'employees',
            key: 'id'
        }
    },
    session_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    session_type: {
        type: DataTypes.ENUM('экзамен', 'зачет', 'курсовая работа'),
        allowNull: false
    }
}, {
    tableName: 'sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['discipline_id']
        },
        {
            fields: ['teacher_id']
        },
        {
            fields: ['session_date']
        }
    ]
});