// models/Employee.js

const mongoose = require('mongoose');
const { normalizeDate } = require('../utils/normDates'); // Import the utility function

const employeeSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    maxDuties: {
        type: Number,
        required: true,
        min: [0, 'maxDuties cannot be negative']
    },
    assignedDuties: {
        type: Number,
        default: 0,
        min: [0, 'assignedDuties cannot be negative']
    },
    unavailableDates: {
        type: [Date],
        default: []
    },
    dutyDates: {
        type: [Date],
        default: []
    }
});

// Pre-save middleware to ensure dates are normalized
employeeSchema.pre('save', function (next) {
    // Normalize unavailableDates
    this.unavailableDates = this.unavailableDates.map(date => normalizeDate(date));

    // Normalize dutyDates
    this.dutyDates = this.dutyDates.map(date => normalizeDate(date));

    next();
});

module.exports = mongoose.model('Employee', employeeSchema);
