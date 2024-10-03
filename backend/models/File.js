const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    contentType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    data: {
        type: Buffer, // To store the file's binary data
        required: true
    }
});

module.exports = mongoose.model('File', fileSchema);
