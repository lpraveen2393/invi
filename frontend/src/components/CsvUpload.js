import React, { useState } from 'react';
import axios from 'axios';
import { parse } from 'papaparse';

const CSVUploader = () => {
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

                const processedData = parsedData.map((row, index) => {
                    if (!row._id) {
                        throw new Error(`Row ${index + 1} is missing _id`);
                    }

                    if (!row.unavailableDates) {
                        throw new Error(`Row ${index + 1} (${row._id}) is missing unavailable dates`);
                    }

                    const unavailableDates = row.unavailableDates.split(',').map(date => {
                        const trimmedDate = date.trim();
                        if (!validateDate(trimmedDate)) {
                            throw new Error(`Invalid or past date in row ${index + 1} (${row._id}): ${trimmedDate}`);
                        }
                        return trimmedDate;
                    });

                    return { _id: row._id, unavailableDates };
                });

                const response = await axios.post('http://localhost:5000/uploadcsv', processedData);
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
            <h1 className="text-2xl font-bold mb-4">CSV Uploader (Employee Unavailable Dates)</h1>
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

export default CSVUploader;