const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');


// Импорт роутов
const router = require('./routes/index')


const app = express();


app.use(express.json());
app.use(cookieParser());

app.use("/static", express.static("src/static"));
app.use('/api', router)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;


    