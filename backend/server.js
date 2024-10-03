const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const employeeRoutes = require('./routes/employees');
const uploadRoute = require('./routes/uploads');
const csvuploadRoute = require('./routes/csvuploads')

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(cors())// Allow CORS from frontend

connectDB();

app.use(express.json());
app.use('/employees', employeeRoutes); // Add '/employees' route prefix
app.use('/uploads', uploadRoute);
app.use('/uploadcsv', csvuploadRoute);// Add '/uploads' route prefix

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
