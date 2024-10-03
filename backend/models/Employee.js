const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    _id: String,
    name: String,
    designation: String,
    maxDuties: Number,
    unavailableDates: [Date]
});

module.exports = mongoose.model('Employee', employeeSchema);