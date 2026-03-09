const sequelize = require('../config/db')
const {DataTypes, UUIDV4} = require('sequelize')

const ContactData = sequelize.define('ContactData', {
    id: {
        type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4
    },
    person_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    person_type: {
        type: DataTypes.ENUM('student', 'employee', 'admin'),
        allowNull: false
    },
    type_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'contact_data_types',
            key: 'id'
        }
    },
    contact: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'contact_data',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['person_id', 'person_type', 'type_id']
        },
        {
            fields: ['person_id', 'person_type']
        },
        {
            fields: ['type_id']
        }
    ]
});

module.exports = ContactData