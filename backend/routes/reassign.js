const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { normalizeDate } = require('../utils/normDates');

/**
 * Removes all unavailable dates and duty dates for all employees
 * @returns {Promise<Object>} - Object containing success status and results
 */
const cleanupAllEmployeeDates = async () => {
    try {
        const result = await Employee.updateMany(
            {},
            { $set: { unavailableDates: [], dutyDates: [], assignedDuties: 0 } }
        );



        return {
            success: true,
            message: 'Successfully cleared dates for all employees',
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount
        };
    } catch (error) {
        console.error('Error clearing all employee dates:', error);
        return {
            success: false,
            message: 'Failed to clear employee dates',
            error: error.message
        };
    }
};

/**
 * Removes all unavailable dates and duty dates for a specific employee
 * @param {string} employeeId - ID of the employee to update
 * @returns {Promise<Object>} - Object containing success status and results
 */
const cleanupEmployeeDates = async (employeeId) => {
    try {
        if (!employeeId) {
            throw new Error('Employee ID is required');
        }

        // First find the employee to get their name
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return {
                success: false,
                message: `No employee found with ID: ${employeeId}`
            };
        }

        const result = await Employee.updateOne(
            { _id: employeeId },
            { $set: { unavailableDates: [], dutyDates: [], assignedDuties: 0 } }
        );



        return {
            success: true,
            message: `Successfully cleared dates for employee ${employee.name} (${employeeId})`,
            employeeName: employee.name,
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount
        };
    } catch (error) {
        console.error(`Error clearing dates for employee ${employeeId}:`, error);
        return {
            success: false,
            message: `Failed to clear dates for employee ${employeeId}`,
            error: error.message
        };
    }
};

/**
 * Manually reassigns duties from one employee to another specific employee
 * @param {string} sourceEmployeeId - ID of the employee whose duties need to be reassigned
 * @param {string} targetEmployeeId - ID of the employee who will receive the duties
 * @returns {Promise<Object>} - Results of reassignment process
 */
const manualReassignDuties = async (sourceEmployeeId, targetEmployeeId) => {
    try {
        if (!sourceEmployeeId || !targetEmployeeId) {
            throw new Error('Source and target employee IDs are required');
        }

        // Find the source employee
        const sourceEmployee = await Employee.findById(sourceEmployeeId);
        if (!sourceEmployee) {
            return {
                success: false,
                message: `No employee found with ID: ${sourceEmployeeId}`
            };
        }

        // Find the target employee
        const targetEmployee = await Employee.findById(targetEmployeeId);
        if (!targetEmployee) {
            return {
                success: false,
                message: `No employee found with ID: ${targetEmployeeId}`
            };
        }

        // If source has no duties, return early
        if (!sourceEmployee.dutyDates || sourceEmployee.dutyDates.length === 0) {
            return {
                success: true,
                message: `No duties to reassign from employee ${sourceEmployeeId}`,
                reassignedCount: 0
            };
        }

        // Check if target employee can accept all duties
        const remainingCapacity = targetEmployee.maxDuties - targetEmployee.assignedDuties;
        const dutiesToTransfer = sourceEmployee.dutyDates;

        if (remainingCapacity < dutiesToTransfer.length) {
            return {
                success: false,
                message: `Target employee ${targetEmployeeId} can only accept ${remainingCapacity} more duties, but trying to transfer ${dutiesToTransfer.length} duties`
            };
        }

        // Check for any date conflicts
        for (const duty of dutiesToTransfer) {
            const dutyDate = new Date(duty.date);
            const hasConflict = targetEmployee.dutyDates.some(targetDuty => {
                const targetDate = new Date(targetDuty.date);
                return targetDate.toDateString() === dutyDate.toDateString();
            });

            if (hasConflict) {
                return {
                    success: false,
                    message: `Target employee ${targetEmployeeId} already has a duty on ${dutyDate.toDateString()}`
                };
            }
        }

        // Transfer duties to target employee
        targetEmployee.dutyDates = [...targetEmployee.dutyDates, ...dutiesToTransfer];
        targetEmployee.assignedDuties += dutiesToTransfer.length;
        await targetEmployee.save();

        // Clear duties from source employee
        sourceEmployee.dutyDates = [];
        sourceEmployee.assignedDuties = 0;
        await sourceEmployee.save();



        return {
            success: true,
            message: `Successfully reassigned ${dutiesToTransfer.length} duties from ${sourceEmployee.name} to ${targetEmployee.name}`,
            sourceName: sourceEmployee.name,
            targetName: targetEmployee.name,
            reassignedCount: dutiesToTransfer.length
        };
    } catch (error) {
        console.error(`Error in manual reassignment from ${sourceEmployeeId} to ${targetEmployeeId}:`, error);
        return {
            success: false,
            message: `Failed to reassign duties: ${error.message}`,
            error: error.message
        };
    }
};

/**
 * Reassigns duties from one employee to another available employee
 * @param {string} employeeId - ID of the employee whose duties need to be reassigned
 * @returns {Promise<Object>} - Results of reassignment process
 */
const reassignEmployeeDuties = async (employeeId) => {
    try {
        if (!employeeId) {
            throw new Error('Employee ID is required');
        }

        // Find the employee whose duties need to be reassigned
        const employee = await Employee.findById(employeeId);

        if (!employee) {
            return {
                success: false,
                message: `No employee found with ID: ${employeeId}`
            };
        }

        // If no duties to reassign, return early
        if (!employee.dutyDates || employee.dutyDates.length === 0) {
            return {
                success: true,
                message: `No duties to reassign for employee ${employeeId}`,
                reassignedCount: 0
            };
        }
        let successCount = 0;
        let failedCount = 0;

        // Process each duty date for reassignment
        for (const duty of employee.dutyDates) {
            const dutyDate = new Date(duty.date);
            const session = duty.session;

            // Find eligible employees for this duty
            // An eligible employee should:
            // 1. Not be the current employee
            // 2. Not have reached their max duties
            // 3. Not already have a duty on this date
            // 4. Not have this date in their unavailable dates
            const eligibleEmployees = await Employee.find({
                _id: { $ne: employeeId },
                $expr: { $lt: ["$assignedDuties", "$maxDuties"] },
                dutyDates: {
                    $not: {
                        $elemMatch: {
                            date: {
                                $gte: new Date(dutyDate.setHours(0, 0, 0, 0)),
                                $lt: new Date(dutyDate.setHours(23, 59, 59, 999))
                            }
                        }
                    }
                },
                unavailableDates: {
                    $not: {
                        $elemMatch: {
                            $gte: new Date(dutyDate.setHours(0, 0, 0, 0)),
                            $lt: new Date(dutyDate.setHours(23, 59, 59, 999))
                        }
                    }
                }
            }).sort({ assignedDuties: 1 });

            if (eligibleEmployees.length === 0) {
                failedCount++;
                continue;
            }

            // Select employee with fewest assigned duties
            const newEmployee = eligibleEmployees[0];
            const newName = newEmployee.name;
            const newId = newEmployee._id;
            // Assign duty to the new employee
            newEmployee.dutyDates.push({
                date: duty.date,
                session: session
            });

            newEmployee.assignedDuties += 1;
            await newEmployee.save();


            successCount++;
        }

        // Clear duties from the original employee
        const clearResult = await Employee.updateOne(
            { _id: employeeId },
            { $set: { dutyDates: [], assignedDuties: 0 } }
        );




        return {
            success: true,
            message: `Reassigned ${successCount} duties from employee ${employee.name} (${employeeId})`,
            employeeName: employee.name,
            totalDuties: employee.dutyDates.length,
            newEmployeeId: newId,
            newEmployeeName: newName,
            reassignedCount: successCount,
            failedCount: failedCount,
        };
    } catch (error) {
        console.error(`Error reassigning duties for employee ${employeeId}:`, error);
        return {
            success: false,
            message: `Failed to reassign duties for employee ${employeeId}`,
            error: error.message
        };
    }
};

// Route to clean up all employees' dates
router.delete('/cleanup', async (req, res) => {
    try {
        const result = await cleanupAllEmployeeDates();
        res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Route to clean up a specific employee's dates
router.delete('/cleanup/:employeeId', async (req, res) => {
    try {
        const { employeeId } = req.params;
        const result = await cleanupEmployeeDates(employeeId);
        res.status(result.success ? 200 : result.matchedCount === 0 ? 404 : 500).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Route to reassign duties from a specific employee to random employees
router.post('/reassign-duties/:employeeId', async (req, res) => {
    try {
        const { employeeId } = req.params;
        const result = await reassignEmployeeDuties(employeeId);
        res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// New route to manually reassign duties from one employee to another
router.post('/transfer-duties', async (req, res) => {
    try {
        const { sourceEmployeeId, targetEmployeeId } = req.body;

        if (!sourceEmployeeId || !targetEmployeeId) {
            return res.status(400).json({
                success: false,
                message: 'Source and target employee IDs are required'
            });
        }

        const result = await manualReassignDuties(sourceEmployeeId, targetEmployeeId);
        res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

module.exports = router;