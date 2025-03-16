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
    dutyDates: [{
        date: { type: Date, required: true },
        session: {
            type: String,
            required: true,
            validate: {
                validator: function (value) {
                    // Accept 'fn' or 'an' (case-insensitive)
                    if (typeof value === 'string' &&
                        (value.toUpperCase() === 'FN' || value.toUpperCase() === 'AN')) {
                        return true;
                    }

                    // Accept integers from 1 to 10
                    const num = parseInt(value);
                    return !isNaN(num) && num > 0 && num <= 10;
                },
                message: props => `${props.value} is not a valid session. Must be 'FN', 'AN', or a number between 1 and 10.`
            }
        }
    }]
});

// Pre-save middleware to ensure dates are normalized
employeeSchema.pre('save', function (next) {
    // Normalize unavailableDates
    this.unavailableDates = this.unavailableDates.map(date => normalizeDate(date));

    // Normalize dutyDates
    this.dutyDates = this.dutyDates.map(duty => {
        duty.date = normalizeDate(duty.date);  // Normalize date for dutyDates

        // Normalize session format (convert to uppercase if string)
        if (typeof duty.session === 'string') {
            duty.session = duty.session.toUpperCase();
        }

        return duty;
    });

    next();
});

module.exports = mongoose.model('Employee', employeeSchema);