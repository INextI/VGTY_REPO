const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');
require('./models') 

// Импорт роутов
const router = require('./routes/index')

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/static", express.static("src/static"));

app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173' // Порт Vite/Vue приложения
}));

// логирование для всех входящих запросов
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.use('/api', router)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;


    