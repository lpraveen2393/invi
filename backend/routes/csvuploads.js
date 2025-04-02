const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const cors = require('cors');
const Employee = require('../models/Employee');

router.use(cors());

// this route is used to upload unavailable data in the form of CSV data and update employee records in the database
// Refer the input csv files/unavailableDates.csv for the format of the csv data
router.post('/', async (req, res) => {
    try {
        const csvData = req.body;
        const currentDate = new Date();

        for (const row of csvData) {
            const { _id, unavailableDates } = row;

            if (!_id) {
                return res.status(400).json({ message: `Invalid data: Missing _id` });
            }

            if (!Array.isArray(unavailableDates) || unavailableDates.length === 0) {
                return res.status(400).json({ message: `Invalid data for ${_id}: Unavailable dates must be a non-empty array` });
            }

            // Parse and validate dates
            const parsedDates = unavailableDates.map(dateString => {
                const date = new Date(dateString);
                if (isNaN(date.getTime()) || date <= currentDate) {
                    throw new Error(`Invalid or past date for ${_id}: ${dateString}`);
                }
                return date;
            });

            // Update the employee document with the new future dates
            await Employee.findByIdAndUpdate(
                _id,
                { $addToSet: { unavailableDates: { $each: parsedDates } } },
            );
        }

        res.json({ message: 'CSV data processed and database updated successfully' });
    } catch (error) {
        console.error('Error processing CSV:', error);
        res.status(400).json({ message: 'Error processing CSV data: ' + error.message });
    }
});

module.exports = router;