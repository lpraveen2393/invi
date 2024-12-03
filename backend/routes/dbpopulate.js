const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { normalizeDate } = require('../utils/normDates');

router.post('/', async (req, res) => {
    try {
        const csvData = req.body;

        // Assuming `csvData` is an array of rows; ensure it's in the expected format.
        const validData = csvData; // Ensure this is properly assigned if `csvData` is not an array.

        const processedData = validData.map((row, index) => {
            const {
                _id,
                name,
                maxDuties,
                assignedDuties = 0,
                unavailableDates = [],
                dutyDates = ''
            } = row;

            // Ensure unavailableDates is a string or array
            const processedUnavailableDates = Array.isArray(unavailableDates)
                ? unavailableDates
                : (unavailableDates || '').split(',').map((date) => {
                    const trimmedDate = date.trim();
                    if (trimmedDate && !validateDate(trimmedDate)) {
                        throw new Error(
                            `Invalid or past date in row ${index + 1} (${_id}): ${trimmedDate}`
                        );
                    }
                    return trimmedDate;
                });

            // Convert dutyDates from '' to an empty array if it's an empty string
            const processedDutyDates = dutyDates === '' ? [] : (Array.isArray(dutyDates) ? dutyDates : [dutyDates]);

            // Return the row with the additional fields
            return {
                _id,
                name,
                maxDuties,
                assignedDuties,
                unavailableDates: processedUnavailableDates,
                dutyDates: processedDutyDates
            };
        });

        // If you need to save `processedData` to the database, you can do it here.
        // For example:
        await Employee.insertMany(processedData);

        res.json({ message: 'CSV data processed and database updated successfully' });
    } catch (error) {
        console.error('Error processing CSV:', error);
        res.status(400).json({ message: 'Error processing CSV data: ' + error.message });
    }
});

module.exports = router;
