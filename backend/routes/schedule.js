const express = require('express');
const { parse } = require('papaparse');
const { createObjectCsvWriter } = require('csv-writer');
const Employee = require('../models/Employee');
const { normalizeDate } = require('../utils/normDates');
const { log } = require('console');
const router = express.Router();
const path = require('path');
const converter = require('json-2-csv');



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
// such that duties only from-today onwards are retained in the database
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

router.post('/', async (req, res) => {
    try {
        console.log('Starting duty assignment process...');
        await cleanupPastDuties();


        // Check if fileContent is provided in the request body
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

//fetches all the exam-duties for a particular date
//csv format syntax - date,session,assinged faculty
//for eg :18-11-2025	1	C1104-Rajkumar, K, C2420-ab, C2434-Dennis Ananth, A

router.get('/exam-duties-date', async (req, res) => {
    try {
        const employees = await Employee.find({});
        const dateWiseDuties = [];
        // Sort duties by date (chronological order)
        dateWiseDuties.sort((a, b) => a.Date - b.Date);
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
            "Exam Date": entry.Date,
            "Session": entry.Session,
            "Assigned Faculty": entry.Employees.join(', ')  // Join all employees for this date-session with comma
        }));

        // Sort by date and session
        formattedData.sort((a, b) => {
            const dateCompare = new Date(a["Exam Date"].split('-').reverse().join('-')) -
                new Date(b["Exam Date"].split('-').reverse().join('-'));
            if (dateCompare === 0) {
                return a.Session.localeCompare(b.Session);
            }
            return dateCompare;
        });

        /**
              * Converts JSON data to CSV format using an on-the-fly method.
              * This avoids creating a CSV file on the server by generating the CSV data in-memory,
              * allowing for immediate download or further processing without file storage.
              *used across all download routes
              */

        const csvContent = await converter.json2csv(formattedData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=exam_duties_by_date.csv');
        res.send(csvContent);
    } catch (error) {
        console.error('Error generating exam schedule by date:', error);
        res.status(500).send('Error generating CSV file');
    }
});


//fetched all the duties for all staff in order
// csv format syntax : faculty_id-faculty_name, date1(session1), date2(session2), ...
//for eg : C1104-Rajkumar, K, 18-11-2025(FN), 19-11-2025(AN)
router.get('/faculty-duty-summary', async (req, res) => {
    try {

        const employees = await Employee.find({});

        const staffWiseDuties = new Map();

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

        // Convert JSON to CSV
        const csvContent = await converter.json2csv(formattedData);

        // Set headers and send response
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=faculty_duty_summary.csv');
        res.send(csvContent);
    } catch (error) {
        console.error('Error generating faculty duty summary:', error);
        res.status(500).send('Error generating CSV file');
    }
});


//fetched all the duties in order for all dates and sessions
//csv format syntax :date,session,staff name,staff id ,dept
router.get('/final-duty-report', async (req, res) => {
    try {
        const employees = await Employee.find({});
        const dayWiseData = [];

        // Process each employee's duty dates
        employees.forEach(employee => {
            employee.dutyDates.forEach(duty => {
                // Format and add each duty to the array
                dayWiseData.push({
                    "Exam-Date": formatDate(duty.date),
                    "Session": duty.session,
                    "Staff Name": 'Dr.' + employee.name,
                    "Staff ID": employee._id,
                    // Using department from employee model if available, else default to SOC
                    "Dept": employee.department || 'SOC'
                });
            });
        });

        // Sort the data by date and session
        dayWiseData.sort((a, b) => {
            const dateA = new Date(a.Date.split('-').reverse().join('-'));
            const dateB = new Date(b.Date.split('-').reverse().join('-'));

            const dateCompare = dateA - dateB;
            if (dateCompare === 0) {
                return a["FN/AN"].localeCompare(b["FN/AN"]);
            }
            return dateCompare;
        });

        const csvContent = await converter.json2csv(dayWiseData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=final_duty_report.csv');
        res.send(csvContent);

    } catch (error) {
        console.error('Error generating final duty report:', error);
        res.status(500).send('Error generating CSV file');
    }
});

//fetches the duties one at a time for each staff
//csv format syntax :staffId,staffName,Exam-Date,session,Dept
//eg:C1001	Rajesh, R	29-11-2025	1	SOC
router.get('/individual-faculty-duties', async (req, res) => {
    try {
        console.log('Starting staff duties export process...');

        // Fetch all employees from database - use existing sort pattern
        const employees = await Employee.find({}).sort({ _id: 1 });

        if (!employees || employees.length === 0) {
            return res.status(400).json({ message: 'No employees found in the database' });
        }

        console.log(`Found ${employees.length} employees for export`);

        // Prepare CSV data
        const csvData = [];

        // Process each employee
        for (const employee of employees) {
            // Skip employees with no duties
            if (!employee.dutyDates || employee.dutyDates.length === 0) {
                continue;
            }

            // Sort the employee's duties chronologically
            const sortedDuties = [...employee.dutyDates].sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);

                // First compare by date
                const dateCompare = dateA - dateB;
                if (dateCompare !== 0) return dateCompare;

                // If same date, sort by session (FN comes before AN)
                return a.session.localeCompare(b.session);
            });

            // Add each duty as a separate row in the CSV
            sortedDuties.forEach(duty => {
                const formattedDate = formatDate(duty.date);
                if (formattedDate) {
                    csvData.push({
                        "Staff ID": employee._id,
                        "Staff Name": 'Dr.' + employee.name,
                        "Exam-Date": formattedDate,
                        "Session": duty.session,
                        "Dept": employee.department || 'SOC'
                    });
                }
            });
        }

        // Check if we have any data to export
        if (csvData.length === 0) {
            return res.status(400).json({ message: 'No duties found for any employees' });
        }

        console.log(`Total ${csvData.length} duty records to be exported`);

        const csvContent = await converter.json2csv(csvData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=individual_faculty_duties.csv');
        res.send(csvContent);

    } catch (error) {
        console.error('Error generating individual faculty duties:', error);
        res.status(500).send('Error generating CSV file');
    }
});

/*
 * Function to assign duties to employees based on the date and required duties.
 * This function filters eligible employees, sorts them by their assigned duties,
 * and assigns them to the specified date and session.
 
 
 
 conditions for assigning duties to an employee/staff:
  1.The employee must be available on the given date(unavailable date must not include the duty date)
  2.  The employee should not have any duties assigned on the given date.
  3.  The employee should not exceed their maximum allowed duties.  




*/

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