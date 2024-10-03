const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/invi', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDb connected  successfully");
    }
    catch {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}
module.exports = connectDB;

