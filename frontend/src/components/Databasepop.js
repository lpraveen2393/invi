import React, { useState } from 'react';
import axios from 'axios';
import { parse } from 'papaparse';

const DbPopulate = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage('');
        setError('');
    };

    const validateDate = (dateString) => {
        const date = new Date(dateString);
        return date > new Date() && !isNaN(date.getTime());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const csvData = event.target.result;
                const parsedData = parse(csvData, { header: true }).data;

                // Filter out empty rows
                const validData = parsedData.filter(
                    (row) => row._id && Object.values(row).some((value) => value && value.trim())
                );

                if (validData.length === 0) {
                    throw new Error('No valid rows found in the CSV file');
                }
                console.log(validData)
                // Process the data
                const processedData = validData.map((row, index) => {
                    const {
                        _id,
                        name,
                        maxDuties,
                        assignedDuties = 0,
                        unavailableDates = [],
                        dutyDates = []
                    } = row;

                    // Validate unavailableDates or set as empty array
                    const processedUnavailableDates = unavailableDates
                        ? unavailableDates.split(',').map((date) => {
                            const trimmedDate = date.trim();
                            if (trimmedDate && !validateDate(trimmedDate)) {
                                throw new Error(
                                    `Invalid or past date in row ${index + 1} (${_id}): ${trimmedDate}`
                                );
                            }
                            return trimmedDate;
                        })
                        : []; // Default to an empty array

                    // Return the row with the additional fields
                    return {
                        _id,
                        name,
                        maxDuties,
                        assignedDuties,
                        unavailableDates: processedUnavailableDates,
                        dutyDates
                    };
                });


                console.log('Processed Data:', processedData);

                const response = await axios.post('http://localhost:5000/dbpopulate', processedData);
                setMessage(response.data.message);
                setError('');
            } catch (error) {
                setError(`Error processing CSV: ${error.message}`);
                setMessage('');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">TO POPULATE THE DATABASE</h1>
            <form onSubmit={handleSubmit} className="mb-4">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="mb-2 p-2 border rounded"
                />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                    Upload
                </button>
            </form>
            {error && <p className="text-red-600">{error}</p>}
            {message && <p className="text-green-600">{message}</p>}
        </div>
    );
};

export default DbPopulate;
