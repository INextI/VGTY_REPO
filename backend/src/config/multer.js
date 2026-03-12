const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const disciplineImgPath = require('./storage').DISCIPLINE_PATH

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, disciplineImgPath);
    },

    filename: function (req, file, cb) {
        const uniqueName =
            uuidv4() + "_" + Date.now() + path.extname(file.originalname);

        cb(null, uniqueName);
    },

   

});

// Настройка фильтра файлов
const fileFilter = (req, file, cb) => {
  // Разрешаем только определенные типы файлов
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'text/html'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Неподдерживаемый тип файла'), false);
  }
};

// Создаем экземпляр multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1 // только один файл за раз
  }
});

module.exports = upload;

