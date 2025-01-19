const express = require('express');
const { parse } = require('papaparse');
const { createObjectCsvWriter } = require('csv-writer');
const Employee = require('../models/Employee');
const { normalizeDate } = require('../utils/normDates');
const router = express.Router();

// Enhanced date formatting with validation
const formatDate = (dateStr) => {
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) throw new Error('Invalid date');
        return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    } catch (error) {
        console.error(`Date formatting error for ${dateStr}:`, error);
        return null;
    }
};

// Function to validate chronological order of dates in CSV
const validateChronologicalOrder = (csvData) => {
    console.log('Validating chronological order of dates...');
    let lastDate = null;
    let lastSession = null;

    for (const row of csvData) {
        const currentDate = normalizeDate(row['Exam Date']);
        const currentSession = row['Session'];

        if (!currentDate) {
            console.error(`Invalid date found: ${row['Exam Date']}`);
            return false;
        }

        if (lastDate) {
            const lastDateTime = lastDate.getTime();
            const currentDateTime = currentDate.getTime();

            if (currentDateTime < lastDateTime) {
                console.error(`Date out of order: ${formatDate(currentDate)} comes after ${formatDate(lastDate)}`);
                return false;
            }

            if (currentDateTime === lastDateTime && currentSession === 'FN' && lastSession === 'AN') {
                console.error(`Session out of order for date ${formatDate(currentDate)}`);
                return false;
            }
        }

        lastDate = currentDate;
        lastSession = currentSession;
    }

    console.log('Date validation successful - all dates are in chronological order');
    return true;
};

// Function to clean up past duties
const cleanupPastDuties = async () => {
    console.log('Starting cleanup of past duties...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const employees = await Employee.find({});
    console.log(`Found ${employees.length} employees for cleanup`);

    for (const employee of employees) {
        const originalCount = employee.dutyDates.length;
        const updatedDutyDates = employee.dutyDates.filter(date => {
            const dutyDate = new Date(date);
            dutyDate.setHours(0, 0, 0, 0);
            return dutyDate >= today;
        });

        if (updatedDutyDates.length !== originalCount) {
            console.log(`Cleaning up duties for ${employee.name}: ${originalCount} -> ${updatedDutyDates.length}`);
            employee.assignedDuties = updatedDutyDates.length;
            employee.dutyDates = updatedDutyDates;
            await employee.save();
        }
    }
    console.log('Cleanup completed');
};

// Endpoint to process CSV file and assign duties
router.post('/', async (req, res) => {
    try {
        console.log('Starting duty assignment process...');
        await cleanupPastDuties();

        const { fileContent } = req.body;
        if (!fileContent) {
            console.error('No file content provided');
            return res.status(400).json({ message: 'No file content provided' });
        }

        const buffer = Buffer.from(fileContent, 'base64');
        const csvContent = buffer.toString('utf-8');
        const csvData = parse(csvContent, { header: true }).data;

        if (!Array.isArray(csvData) || csvData.length === 0) {
            console.error('Invalid or empty CSV data');
            return res.status(400).json({ message: 'Invalid or empty CSV file' });
        }

        const validCsvData = csvData.filter(row => row['Exam Date'] && row['Duty'] && row['Session']);
        console.log(`Found ${validCsvData.length} valid exam duty entries`);

        // Validate chronological order
        if (!validateChronologicalOrder(validCsvData)) {
            return res.status(400).json({ message: 'Dates in CSV are not in chronological order' });
        }

        const results = [];
        const assignmentStats = {
            totalRequired: 0,
            totalAssigned: 0
        };

        for (const [index, row] of validCsvData.entries()) {
            const examDateStr = row['Exam Date'];
            const maxDutiesStr = row['Duty'];
            const session = row['Session'];

            console.log(`\nProcessing row ${index + 1}: ${examDateStr} ${session} - Required duties: ${maxDutiesStr}`);

            const examDate = normalizeDate(examDateStr);
            if (!examDate) {
                console.error(`Invalid date format for row ${index + 1}: ${examDateStr}`);
                results.push(`Row ${index + 1}: Invalid date format - ${examDateStr}`);
                continue;
            }

            const maxDuties = parseInt(maxDutiesStr, 10);
            assignmentStats.totalRequired += maxDuties;

            const assignedDuties = await assignDuties(examDate, maxDuties, session);
            assignmentStats.totalAssigned += assignedDuties.length;

            console.log(`Completed row ${index + 1}: Assigned ${assignedDuties.length}/${maxDuties} duties`);
            results.push(`Row ${index + 1} (${session}): Assigned ${assignedDuties.length}/${maxDuties} duties`);
        }

        console.log('\nDuty assignment process completed');
        console.log(`Total duties required: ${assignmentStats.totalRequired}`);
        console.log(`Total duties assigned: ${assignmentStats.totalAssigned}`);
        console.log(`Assignment success rate: ${((assignmentStats.totalAssigned / assignmentStats.totalRequired) * 100).toFixed(2)}%`);

        res.json({
            message: 'Duties processed',
            results,
            stats: assignmentStats
        });
    } catch (error) {
        console.error('Error processing CSV:', error);
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
});
router.get('/date-wise-duties', async (req, res) => {
    try {
        // Clean up past duties before generating report


        // Fetch all employees and their duties
        const employees = await Employee.find({});
        const dateWiseDuties = [];



        // Sort duties by date (chronological order)
        dateWiseDuties.sort((a, b) => a.Date - b.Date);
        // Within the date-wise-duties route
        // First create a map to group employees by date and session
        const dateSessionMap = new Map();

        employees.forEach(employee => {
            employee.dutyDates.forEach(duty => {
                const dateStr = formatDate(duty.date);
                const sessionStr = duty.session;
                const key = `${dateStr}-${sessionStr}`;

                if (!dateSessionMap.has(key)) {
                    dateSessionMap.set(key, {
                        Date: dateStr,
                        Session: sessionStr,
                        Employees: []
                    });
                }

                dateSessionMap.get(key).Employees.push(`${employee._id}-${employee.name}`);
            });
        });
        dateWiseDuties.sort((a, b) => a.Date - b.Date);
        // Convert map to array and format data
        const formattedData = Array.from(dateSessionMap.values()).map(entry => ({
            Date: entry.Date,
            Session: entry.Session,
            Employee: entry.Employees.join(', ')  // Join all employees for this date-session with comma
        }));

        // Sort by date and session
        formattedData.sort((a, b) => {
            const dateCompare = new Date(a.Date.split('-').reverse().join('-')) -
                new Date(b.Date.split('-').reverse().join('-'));
            if (dateCompare === 0) {
                return a.Session.localeCompare(b.Session);
            }
            return dateCompare;
        });

        const csvWriter = createObjectCsvWriter({
            path: './date_wise_duty.csv',
            header: [
                { id: 'Date', title: 'Exam Date' },
                { id: 'Session', title: 'Session' },
                { id: 'Employee', title: 'Assigned Faculty' }
            ]
        });

        await csvWriter.writeRecords(formattedData);

        res.download('./date_wise_duty.csv', 'date_wise_duty.csv');
    } catch (error) {
        console.error('Error generating date-wise duties:', error);
        res.status(500).send('Error generating CSV file');
    }
});

router.get('/staff-wise-duties', async (req, res) => {
    try {
        // Clean up past duties before generating report


        // Fetch all employees and their duties
        const employees = await Employee.find({});
        // Modified staff-wise duties processing code
        const staffWiseDuties = new Map(); // Using Map instead of plain object for better handling

        employees.forEach(employee => {
            if (employee.dutyDates.length > 0) {
                const duties = employee.dutyDates.flatMap(duty => {
                    const { date, session } = duty;
                    if (date instanceof Date) {
                        return [{ Date: new Date(date), Session: session }];
                    }
                    return [];
                });

                // Sort duties for the employee by date and session
                duties.sort((a, b) => {
                    const dateCompare = a.Date - b.Date;
                    if (dateCompare === 0) {
                        return a.Session.localeCompare(b.Session);
                    }
                    return dateCompare;
                });

                // Use employee ID and name as the key
                const facultyKey = `${employee._id}-${employee.name}`;
                staffWiseDuties.set(facultyKey, duties.map(duty => `${formatDate(duty.Date)}(${duty.Session})`));
            }
        });

        // Convert Map to array and format data
        const formattedData = Array.from(staffWiseDuties.entries()).map(([faculty, dates]) => ({
            Faculty: faculty,
            Dates: dates.join(',')
        }));

        // Sort by faculty ID
        formattedData.sort((a, b) => a.Faculty.localeCompare(b.Faculty));

        const csvWriter = createObjectCsvWriter({
            path: './staff_wise_duty.csv',
            header: [
                { id: 'Faculty', title: 'Faculty' },
                { id: 'Dates', title: 'Dates' }
            ]
        });

        await csvWriter.writeRecords(formattedData);
        res.download('./staff_wise_duty.csv', 'staff_wise_duty.csv');
    } catch (error) {
        console.error('Error generating staff-wise duties:', error);
        res.status(500).send('Error generating CSV file');
    }
});



const assignDuties = async (date, requiredDuties, session) => {
    const allEmployees = await Employee.find({});
    const eligibleEmployees = allEmployees.filter(employee => {
        const targetDateStr = date.toISOString().split('T')[0];
        const hasDutyOnDate = employee.dutyDates.some(d => {
            return new Date(d.date).toISOString().split('T')[0] === targetDateStr;
        });
        return !hasDutyOnDate && employee.assignedDuties < employee.maxDuties;
    });

    eligibleEmployees.sort((a, b) => a.assignedDuties - b.assignedDuties);
    const assignedDuties = [];

    for (let i = 0; i < requiredDuties; i++) {
        const employee = eligibleEmployees.shift();
        if (!employee) break;

        // Create duty object according to schema
        employee.dutyDates.push({
            date: date,
            session: session
        });

        employee.assignedDuties += 1;
        await employee.save();

        assignedDuties.push({
            Date: formatDate(date),
            Session: session,
            EmployeeId: employee._id,
            EmployeeName: employee.name
        });
    }

    return assignedDuties;
};
module.exports = router;
