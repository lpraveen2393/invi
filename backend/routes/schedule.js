const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const cors = require('cors');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

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

        const csvDates = csvData.map(row => normalizeDate(row['Date']));
        const csvEarliestDate = new Date(Math.min(...csvDates));
        const csvLatestDate = new Date(Math.max(...csvDates));

        // Check if any duty dates exist in the database
        const existingDutyDates = await Employee.find({ dutyDates: { $exists: true, $ne: [] } });

        let earliestDate, endDate;
        if (existingDutyDates.length > 0) {
            // If duty dates exist, find the earliest and latest from database
            const dbDates = existingDutyDates.flatMap(emp => emp.dutyDates);
            earliestDate = new Date(Math.min(...dbDates));
            endDate = new Date(Math.max(...dbDates));
        } else {
            // If no duty dates, use CSV dates
            earliestDate = csvEarliestDate;
            endDate = csvLatestDate;
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

        await generateDutyScheduleCSV(earliestDate, endDate);

        res.json({
            message: 'Duties assigned and CSV file generated successfully',
            filePath: 'employee_duty_schedule.csv'
        });
    } catch (error) {
        console.error('Error processing duties:', error);
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
});

const generateDutyScheduleCSV = async (startDate, endDate) => {
    const employees = await Employee.find({});
    const dateRange = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        // Format date as DD-MM-YYYY
        const formattedDate = currentDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');

        dateRange.push(formattedDate);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    const csvData = employees.map(emp => {
        const row = {
            empCode: emp._id.toString(),
            empName: emp.name
        };

        dateRange.forEach(date => {
            // Convert date to YYYY-MM-DD for comparison
            const [day, month, year] = date.split('-');
            const comparisonDate = `${year}-${month}-${day}`;

            row[date] = emp.dutyDates.some(dutyDate =>
                dutyDate.toISOString().split('T')[0] === comparisonDate
            ) ? 'Yes' : 'No';
        });

        return row;
    });

    const headers = [
        { id: 'empCode', title: 'Employee Code' },
        { id: 'empName', title: 'Employee Name' },
        ...dateRange.map(date => ({ id: date, title: date }))
    ];

    const csvWriter = createCsvWriter({
        path: 'employee_duty_schedule.csv',
        header: headers
    });

    await csvWriter.writeRecords(csvData);

    console.log('CSV file created successfully: employee_duty_schedule.csv');
    return 'employee_duty_schedule.csv';
};

const assignDuties = async (date, requiredDuties) => {
    const assignedDuties = [];
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const eligibleEmployees = await Employee.find({
        maxDuties: { $gt: 0 },
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
    }).sort({ assignedDuties: 1 });

    const employeesToUpdate = [];
    const dateString = date.toLocaleDateString('en-GB').replace(/\//g, '-');

    for (let i = 0; i < requiredDuties; i++) {
        if (eligibleEmployees.length > 0) {
            const selectedEmployee = eligibleEmployees.shift();

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
            =========================
            🎉 Duty Assignment 🎉
            -------------------------
            📅 Date: ${dateString}
            👤 Employee: ${selectedEmployee.name}
            🔢 Emp Code: ${selectedEmployee._id}
            ✅ Status: Assigned
            =========================
            `);

            if (selectedEmployee.assignedDuties + 1 < selectedEmployee.maxDuties) {
                selectedEmployee.assignedDuties += 1;
                eligibleEmployees.push(selectedEmployee);
            }
        } else {
            console.log(`⚠️ No eligible employees left for date ${dateString}`);
            break;
        }
    }

    if (employeesToUpdate.length > 0) {
        await Employee.bulkWrite(employeesToUpdate);
    }

    return assignedDuties;
};

module.exports = router;