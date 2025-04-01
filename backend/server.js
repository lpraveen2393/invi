const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const employeeRoutes = require('./routes/employees');
const uploadRoute = require('./routes/uploads');
const csvuploadRoute = require('./routes/csvuploads');
const scheduleRoute = require('./routes/schedule');
const DbPopulate = require('./routes/dbpopulate');

const app = express();
const PORT = process.env.PORT || 5000 || 5001 || 8880;

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));



connectDB();

app.use(express.json());
app.use('/employees', employeeRoutes);
app.use('/uploadcsv', csvuploadRoute);
app.use('/schedule', scheduleRoute);
app.use('/dbpopulate', DbPopulate);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
