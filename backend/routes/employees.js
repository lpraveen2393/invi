const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// Update employee unavailable dates by ID
router.put('/', async (req, res) => {
    console.log(req.body)
    const empid = req.body.employeeId
    const unavailableDates = req.body.unavailableDates;

    try {
        const employee = await Employee.findOneAndUpdate(
            { _id: empid }, // Use empid for searching
            { $set: { unavailableDates } }, // Update the unavailableDates field
            { new: true } // Return the updated document
        );

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;