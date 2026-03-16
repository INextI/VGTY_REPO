require('dotenv').config()
const documentJobProcessor = require('./services/documentJobProcessor');
const sequelize = require('./config/db')

const swaggerAutogen = require('swagger-autogen')();
const outputFile = './swagger-output.json';
const endpointsFiles = ['./app.js']; // файлы с роутами

const {createFolders} = require('./config/storage')

const PORT = process.env.PORT || 5000

const start = async () => {
  try {
    await swaggerAutogen(outputFile, endpointsFiles);

    createFolders();

    const app = require('./app')
    await sequelize.authenticate()
    await sequelize.sync() // {forse: true} для пересоздания
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
    });
  } catch (e) {
    console.log(e)
    console.error('❌ Server startup failed:', e);
    process.exit(1); // чтобы Docker понял, что была ошибка
  }
}
/*
// После инициализации базы данных
documentJobProcessor.start();

// Для корректного завершения
process.on('SIGINT', () => {
  documentJobProcessor.stop();
  process.exit(0);
});
*/
start()