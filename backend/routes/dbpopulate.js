const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

router.post('/', async (req, res) => {
    try {
        const csvData = req.body;

        if (!Array.isArray(csvData) || csvData.length === 0) {
            throw new Error('No valid rows found in the CSV file');
        }

        // Process each row from the CSV
        const bulkOperations = csvData.map((row) => {
            const facultyDetails = row.facultyDetails;
            const maxDuties = row.maxDuties;

            // Extract staffId and name from facultyDetails
            // Format is like "C037-Kannan, K" or "RS889-Ushadevi, G"
            const parts = facultyDetails.split('-');
            const staffId = parts[0].trim();
            const name = parts[1] ? parts[1].trim() : '';

            // Create the employee document
            return {
                updateOne: {
                    filter: { _id: staffId },
                    update: {
                        $set: {
                            name: name,
                            maxDuties: maxDuties,
                            assignedDuties: 0,
                            dutyDates: [],
                            unavailableDates: []
                        }
                    },
                    upsert: true
                }
            };
        });

        // Perform bulkWrite with upsert
        const result = await Employee.bulkWrite(bulkOperations);

        res.json({
            message: 'Faculty data processed and database updated successfully',
            processed: result.modifiedCount + result.upsertedCount
        });
    } catch (error) {
        console.error('Error processing faculty data:', error);
        res.status(400).json({
            message: 'Error processing faculty data: ' + error.message
        });
    }
});

module.exports = router;