const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');


const CompletedSession = sequelize.define('CompletedSession', {
    id: {
        type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4
    },
    student_id: {
       type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'students',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    session_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'sessions',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    rating: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        validate: {
            isInRange(value) {
                if (value !== null && value !== 0 && (value < 2 || value > 5)) {
                    throw new Error('Rating must be between 2 and 5, or 0');
                }
            }
        }
    }
}, {
    tableName: 'completed_sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['student_id', 'session_id']
        },
        {
            fields: ['student_id']
        },
        {
            fields: ['session_id']
        },
        {
            fields: ['rating']
        }
    ]
});

module.exports = CompletedSession