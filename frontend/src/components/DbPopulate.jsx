import React, { useState } from 'react';
import axios from 'axios';
import { parse } from 'papaparse';

const DbPopulate = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage('');
        setError('');
    };
    /** Retrieves the file from the input 
    * - Skips the header row and any empty lines from the CSV or text file.
    * - Sends the cleaned data to the backend endpoint at "http://localhost:5000/dbpopulate" to populate the db.
    * - refer the input csv file/dbPopulate.csv for the format of the csv file.
 */

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file');
            return;
        }

        setIsLoading(true);
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const csvData = event.target.result;
                // Parse CSV with headers
                const parsedData = parse(csvData, {
                    header: true,
                    skipEmptyLines: true
                }).data;

                // Process the data to match backend expectations
                const processedData = parsedData.map(row => {
                    // Get the values from the CSV columns
                    const facultyDetails = row['FACULTY DETAILS2'];
                    const maxDuties = parseInt(row['MAX DUTIES'], 10);

                    return {
                        facultyDetails: facultyDetails,
                        school: row['SCHOOL'],
                        maxDuties: maxDuties
                    };
                });

                if (processedData.length === 0) {
                    throw new Error('No valid rows found in the CSV file');
                }

                const response = await axios.post('http://localhost:5000/dbpopulate', processedData);
                setMessage(response.data.message);
                setError('');
            } catch (error) {
                setError(`Error: ${error.message || 'Failed to process CSV file'}`);
                setMessage('');
            } finally {
                setIsLoading(false);
            }
        };

        reader.onerror = () => {
            setError('Failed to read file');
            setIsLoading(false);
        };

        reader.readAsText(file);
    };
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Database Population Tool</h1>
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Upload Faculty CSV File
                        </label>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !file}
                        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${(isLoading || !file) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {isLoading ? 'Processing...' : 'Upload and Process'}
                    </button>
                </form>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {message && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4" role="alert">
                        <span className="block sm:inline">{message}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DbPopulate;