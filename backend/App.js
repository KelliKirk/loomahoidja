const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

require('./models');

const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/sitters', require('./routes/sitter.routes'));

app.use(errorHandler);

module.exports = app;