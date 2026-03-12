// middleware/formDataLogger.js
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const formDataLogger = (req, res, next) => {
  // Сохраняем оригинальные методы
  const originalJson = res.json;
  const originalSend = res.send;
  
  // Перехватываем запрос
  console.log('=== FORM DATA LOGGER ===');
  console.log('Headers:', req.headers);
  console.log('Body (до multer):', req.body);
  
  // Перехватываем ответ
  res.json = function(data) {
    console.log('Response JSON:', data);
    return originalJson.call(this, data);
  };
  
  res.send = function(data) {
    console.log('Response send:', data);
    return originalSend.call(this, data);
  };
  
  next();
};

module.exports = { upload, formDataLogger };
