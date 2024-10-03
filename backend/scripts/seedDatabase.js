const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const connectDB = require('../config/database');

const employeesData = [
    {
        "_id": "EMP001",
        "name": "John Doe",
        "designation": "RA",
        "maxDuties": 5,
        "unavailableDates": []
    },
    {
        "_id": "EMP002",
        "name": "Jane Smith",
        "designation": "RA",
        "maxDuties": 5,
        "unavailableDates": []
    },
    {
        "_id": "EMP003",
        "name": "Mike Johnson",
        "designation": "RA",
        "maxDuties": 5,
        "unavailableDates": []
    },
    {
        "_id": "EMP004",
        "name": "Emily Brown",
        "designation": "RA",
        "maxDuties": 5,
        "unavailableDates": []
    },
    {
        "_id": "EMP005",
        "name": "Chris Wilson",
        "designation": "RA",
        "maxDuties": 5,
        "unavailableDates": []
    },
    {
        "_id": "EMP006",
        "name": "Sarah Davis",
        "designation": "AP3",
        "maxDuties": 4,
        "unavailableDates": []
    },
    {
        "_id": "EMP007",
        "name": "Tom Anderson",
        "designation": "AP3",
        "maxDuties": 4,
        "unavailableDates": []
    },
    {
        "_id": "EMP008",
        "name": "Lisa Taylor",
        "designation": "AP3",
        "maxDuties": 4,
        "unavailableDates": []
    },
    {
        "_id": "EMP009",
        "name": "Robert Martin",
        "designation": "AP3",
        "maxDuties": 4,
        "unavailableDates": []
    },
    {
        "_id": "EMP010",
        "name": "Emma White",
        "designation": "AP3",
        "maxDuties": 4,
        "unavailableDates": []
    },
    {
        "_id": "EMP011",
        "name": "David Lee",
        "designation": "AP2",
        "maxDuties": 3,
        "unavailableDates": []
    },
    {
        "_id": "EMP012",
        "name": "Karen Clark",
        "designation": "AP2",
        "maxDuties": 3,
        "unavailableDates": []
    },
    {
        "_id": "EMP013",
        "name": "Michael Harris",
        "designation": "AP2",
        "maxDuties": 3,
        "unavailableDates": []
    },
    {
        "_id": "EMP014",
        "name": "Jennifer Lewis",
        "designation": "AP2",
        "maxDuties": 3,
        "unavailableDates": []
    },
    {
        "_id": "EMP015",
        "name": "Daniel Walker",
        "designation": "AP2",
        "maxDuties": 3,
        "unavailableDates": []
    },
    {
        "_id": "EMP016",
        "name": "Olivia Green",
        "designation": "AP1",
        "maxDuties": 2,
        "unavailableDates": []
    },
    {
        "_id": "EMP017",
        "name": "James Hall",
        "designation": "AP1",
        "maxDuties": 2,
        "unavailableDates": []
    },
    {
        "_id": "EMP018",
        "name": "Sophia Young",
        "designation": "AP1",
        "maxDuties": 2,
        "unavailableDates": []
    },
    {
        "_id": "EMP019",
        "name": "William Turner",
        "designation": "AP1",
        "maxDuties": 2,
        "unavailableDates": []
    },
    {
        "_id": "EMP020",
        "name": "Ava Robinson",
        "designation": "AP1",
        "maxDuties": 2,
        "unavailableDates": []
    }
];

const seedDatabase = async () => {
    try {
        await connectDB();
        await Employee.deleteMany();
        await Employee.insertMany(employeesData);
        console.log('Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();