const express = require('express');
require('dotenv').config();
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./utils/error_handler');
const documentRoutes = require('./routes/documents/documentsRoutes');
const gitRoutes = require('./routes/gitRoutes');



const app = express();
app.use(express.json());


app.use('/api/auth', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/git', gitRoutes)


app.use(errorHandler);

module.exports = app;
