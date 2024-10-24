// routes/dutyAssignment.js

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const cors = require('cors');

const Employee = require('../models/Employee');
const { normalizeDate } = require('../utils/normDates');

router.use(cors());
router.use(express.json());

router.post('/', async (req, res) => {
    try {
        const csvData = req.body;
        const currentDate = new Date();
        currentDate.setUTCHours(0, 0, 0, 0);

        if (!Array.isArray(csvData)) {
            return res.status(400).json({ message: 'Invalid data format: Expected an array of records.' });
        }

        for (const [index, row] of csvData.entries()) {
            const { Date: examDateStr, 'Max Duties': maxDutiesStr } = row;

            if (!examDateStr || !maxDutiesStr) {
                return res.status(400).json({ message: `Invalid data at row ${index + 1}: Missing exam date or max duties` });
            }

            const examDate = normalizeDate(examDateStr);
            const maxDuties = parseInt(maxDutiesStr, 10);

            if (isNaN(examDate.getTime())) {
                return res.status(400).json({ message: `Invalid date format at row ${index + 1}: ${examDateStr}` });
            }

            if (isNaN(maxDuties) || maxDuties <= 0) {
                return res.status(400).json({ message: `Invalid max duties at row ${index + 1}: ${maxDutiesStr}` });
            }

            if (examDate <= currentDate) {
                return res.status(400).json({ message: `Exam date must be in the future at row ${index + 1}: ${examDateStr}` });
            }

            await assignDuties(examDate, maxDuties);
        }

        res.json({ message: 'CSV data processed and duties assigned successfully' });
    } catch (error) {
        console.error('Error processing CSV:', error);
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
});

const assignDuties = async (date, requiredDuties) => {
    const assignedDuties = [];

    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Find eligible employees
    const eligibleEmployees = await Employee.find({
        maxDuties: { $gt: 0 },
        // $expr: { $lt: ["$assignedDuties", "$maxDuties"] }, // Compare assignedDuties with maxDuties
        unavailableDates: {
            $not: {
                $elemMatch: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            }
        },
        dutyDates: {
            $not: {
                $elemMatch: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            }
        }
    }).sort({ assignedDuties: 1 });  // Sort by least assigned duties

    console.log(`Found ${eligibleEmployees.length} eligible employees for date ${date.toISOString().split('T')[0]}`);

    const employeesToUpdate = [];

    for (let i = 0; i < requiredDuties; i++) {
        if (eligibleEmployees.length > 0) {
            // Select the first eligible employee (least assigned duties)
            const selectedEmployee = eligibleEmployees.shift();

            // Prepare the update
            employeesToUpdate.push({
                updateOne: {
                    filter: { _id: selectedEmployee._id },
                    update: {
                        $push: { dutyDates: date },
                        $inc: { assignedDuties: 1 }
                    }
                }
            });

            assignedDuties.push(selectedEmployee);
            console.log(`
==================================================================
  🎯 Duty Assignment  DATE:${date.toISOString().split('T')[0]}
==================================================================
    👤 Employee ID : ${selectedEmployee._id}
    🧑‍💼 Employee Name : ${selectedEmployee.name}
    📅 DUTY Date: ${date.toISOString().split('T')[0]}
==================================================================
`);



            // If the employee hasn't reached their max duties, move them to the end of the list
            if (selectedEmployee.assignedDuties + 1 < selectedEmployee.maxDuties) {
                selectedEmployee.assignedDuties += 1;
                eligibleEmployees.push(selectedEmployee);
            }
        } else {
            console.log(`No eligible employees left for date ${date.toISOString().split('T')[0]}`);
            break;
        }
    }

    if (employeesToUpdate.length > 0) {
        await Employee.bulkWrite(employeesToUpdate);
    }

    if (assignedDuties.length === requiredDuties) {
        console.log(`Successfully assigned all duties for date ${date.toISOString().split('T')[0]}. Assigned: ${assignedDuties.length}/${requiredDuties}`);
    } else {
        console.log(`Could not assign all duties for date ${date.toISOString().split('T')[0]}. Assigned: ${assignedDuties.length}/${requiredDuties}`);
    }

    return assignedDuties;
};

module.exports = router;