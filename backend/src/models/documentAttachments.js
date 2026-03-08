const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const DocumentAttachment = sequelize.define('DocumentAttachment', {
    id: {type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4},
    name: { type: DataTypes.STRING, allowNull: false },
    type_id: { type: DataTypes.UUID, allowNull: false },
    doc: { type: DataTypes.BLOB, allowNull: false }, // BLOB для двоичных данных
    upload_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    department_id: { type: DataTypes.UUID },
    discipline_id: { type: DataTypes.UUID },
    edu_program_id: { type: DataTypes.UUID },
    session_id: { type: DataTypes.UUID }
}, {
    tableName: 'document_attachments',
    timestamps: false,
    validate: {
        checkAttachmentOwner() {
            const fields = [this.department_id, this.discipline_id, this.edu_program_id, this.session_id];
            const nonNullFields = fields.filter(field => field != null);
            
            if (nonNullFields.length !== 1) {
                throw new Error('Документ должен быть привязан ровно к одной сущности (кафедра, дисциплина, программа или сессия)');
            }
        }
    }
})

module.exports = DocumentAttachment