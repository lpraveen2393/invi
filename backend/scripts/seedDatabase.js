const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const connectDB = require('../config/database');

const employeesData = [
    {
        _id: "EMP001",
        name: "John Doe",
        maxDuties: 5,
        assignedDuties: 0,
        unavailableDates: [],
        dutyDates: []
    },
    {
        _id: "EMP002",
        name: "Jane Smith",
        maxDuties: 5,
        assignedDuties: 0,
        unavailableDates: [],
        dutyDates: []
    },
    {
        _id: "EMP003",
        name: "Mike Johnson",
        maxDuties: 5,
        assignedDuties: 0,
        unavailableDates: [],
        dutyDates: []
    },
    {
        _id: "EMP004",
        name: "Emily Brown",
        maxDuties: 5,
        assignedDuties: 0,
        unavailableDates: [],
        dutyDates: []
    },
    {
        _id: "EMP005",
        name: "Chris Wilson",
        maxDuties: 5,
        assignedDuties: 0,
        unavailableDates: [],
        dutyDates: []
    },
    {
        _id: "EMP006",
        name: "Sarah Davis",
        maxDuties: 4,
        assignedDuties: 0,
        unavailableDates: [],
        dutyDates: []
    },
    {
        _id: "EMP007",
        name: "Tom Anderson",
        maxDuties: 4,
        assignedDuties: 0,
        unavailableDates: [],
        dutyDates: []
    },
    {
        _id: "EMP008",
        name: "Lisa Taylor",
        maxDuties: 4,
        assignedDuties: 0,
        unavailableDates: [],
        dutyDates: []
    },
    {
        _id: "EMP009",
        name: "Robert Martin",
        maxDuties: 4,
        assignedDuties: 0,
        unavailableDates: [],
        dutyDates: []
    },
    {
        _id: "EMP010",
        name: "Emma White",
        maxDuties: 4,
        assignedDuties: 0,
        unavailableDates: [],
        dutyDates: []
    },
    {
        _id: "EMP011",
        name: "David Lee",
        maxDuties: 3,
        assignedDuties: 0,
        unavailableDates: [],
        dutyDates: []
    },
    {
        _id: "EMP012",
        name: "Karen Clark",
        maxDuties: 3,
        assignedDuties: 0,
        unavailableDates: [],
        dutyDates: []
    },
    {
        _id: "EMP013",
        name: "Michael Harris",
        maxDuties: 3,
        assignedDuties: 0,
        unavailableDates: [],
        dutyDates: []
    },
    {
        _id: "EMP014",
        name: "Jennifer Lewis",
        maxDuties: 3,
        assignedDuties: 0,
        unavailableDates: [],
        dutyDates: []
    },
    {
        _id: "EMP015",
        name: "Daniel Walker",
        maxDuties: 3,
        assignedDuties: 0,
        unavailableDates: [],
        dutyDates: []
    },
    {
        _id: "EMP016",
        name: "Olivia Green",
        maxDuties: 2,
        assignedDuties: 0,
        unavailableDates: [],
        dutyDates: []
    },
    {
        _id: "EMP017",
        name: "James Hall",
        maxDuties: 2,
        assignedDuties: 0,
        unavailableDates: [],
        dutyDates: []
    },
    {
        _id: "EMP018",
        name: "Sophia Young",
        maxDuties: 2,
        assignedDuties: 0,
        unavailableDates: [],
        dutyDates: []
    },
    {
        _id: "EMP019",
        name: "William Turner",
        maxDuties: 2,
        assignedDuties: 0,
        unavailableDates: [],
        dutyDates: []
    },
    {
        _id: "EMP020",
        name: "Ava Robinson",
        maxDuties: 2,
        assignedDuties: 0,
        unavailableDates: [],
        dutyDates: []
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