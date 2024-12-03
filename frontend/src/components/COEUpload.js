import React, { useState } from 'react';
import axios from 'axios';

const CSVUpload = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage('Please select a file');
            return;
        }

        setLoading(true);
        setMessage('');

        const reader = new FileReader();
        reader.onload = async (event) => {
            const csv = event.target.result;
            const lines = csv.split('\n');
            const headers = lines[0].split(',');
            const jsonData = [];

            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim() === '') continue;
                const values = lines[i].split(',');
                const row = {};
                for (let j = 0; j < headers.length; j++) {
                    row[headers[j].trim()] = values[j].trim();
                }
                jsonData.push(row);
            }

            try {
                const response = await axios.post('http://localhost:5000/schedule', jsonData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                setMessage('CSV processed and duties assigned successfully');
            } catch (error) {
                console.error('Error processing CSV:', error);
                setMessage('Error processing CSV: ' + (error.response?.data?.message || error.message));
            } finally {
                setLoading(false);
            }
        };

        reader.onerror = (error) => {
            setMessage('Error reading file: ' + error);
            setLoading(false);
        };

        reader.readAsText(file);
    };

    return (
        <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="csvFile" className="block text-sm font-medium text-gray-700">
                        EXAM SCHEDULE BY COE
                    </label>
                    <input
                        type="file"
                        id="csvFile"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="mt-1 block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    {loading ? 'Processing...' : 'Upload and Process CSV'}
                </button>
            </form>
            {message && (
                <div className={`mt-4 text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default CSVUpload;