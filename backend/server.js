const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const employeeRoutes = require('./routes/employees');
const csvuploadRoute = require('./routes/csvuploads');
const scheduleRoute = require('./routes/schedule');
const DbPopulate = require('./routes/dbpopulate');
const ReAssign = require('./routes/reassign');
const app = express();
const PORT = process.env.PORT;

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));



connectDB();

app.use(express.json());
//all the routes are defined and used
app.use('/employees', employeeRoutes);
app.use('/uploadcsv', csvuploadRoute);
app.use('/schedule', scheduleRoute);
app.use('/dbpopulate', DbPopulate);
app.use('/reassign', ReAssign);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
