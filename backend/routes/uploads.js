const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const File = require('../models/File');
const xlsx = require('xlsx');// Import the file schema

// Set up multer storage in memory (not on disk) for storing files as buffers
const storage = multer.memoryStorage();
const upload = multer({ storage });


/*
function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}
*/

router.get('/read', async (req, res) => {
    try {
        const firstFile = await File.findOne({});

        if (!firstFile) {
            return res.status(404).send('No files found in the collection.');
        }
        if (firstFile.contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            // Convert the file buffer (firstFile.data) into a readable workbook
            const workbook = xlsx.read(firstFile.data, { type: 'buffer' });

            // Get the first worksheet (you can change this based on your needs)
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convert the worksheet to JSON (easy to handle the data)
            let jsonData = xlsx.utils.sheet_to_json(worksheet);

            /*jsonData = jsonData.map(row => {
                if (row.Date) {  // Assuming the date column header is 'Date'
                    // Convert to a string format 'yyyy-mm-dd' using the formatDate function
                    row.Date = formatDate(row.Date);
                }
                return row; // Don't forget to return the row after modification
            });*/


            // Log the JSON data from the Excel file
            console.log('Excel File Data:', jsonData);

            // Send the Excel file data as the response
            return res.status(200).json(jsonData);
        }
        const fileContent = firstFile.data.toString();
        console.log('First File Content:', fileContent);
        res.status(200).send('First file content logged to console successfully.');
    } catch (error) {
        console.error('Error reading the first file from MongoDB:', error);
        res.status(500).send('Error reading the first file.');
    }
});


router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        // Create a new file document with the file data and metadata
        const newFile = new File({
            filename: req.file.originalname,
            contentType: req.file.mimetype,
            size: req.file.size,
            data: req.file.buffer // Store the file's buffer in MongoDB
        });

        // Save the file in the MongoDB collection
        await newFile.save();

        res.status(200).send('File uploaded and saved to database.');
    } catch (error) {
        console.error('Error while uploading the file:', error);
        res.status(500).send('Error uploading file.');
    }
});

module.exports = router;
