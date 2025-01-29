import React, { useState } from 'react';
import axios from 'axios';

const COEUpload = () => {
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
        reader.onloadend = async () => {
            const fileContent = reader.result.split(',')[1];

            try {
                const response = await axios.post('http://localhost:5000/schedule', { fileContent });
                setMessage(response.data.message);
            } catch (error) {
                console.error('Error processing CSV:', error);
                setMessage('Error processing CSV: ' + (error.response?.data?.message || error.message));
            } finally {
                setLoading(false);
            }
        };

        reader.readAsDataURL(file);
    };

    const handleDownload = async (endpoint) => {
        try {
            const response = await axios.get(`http://localhost:5000${endpoint}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', endpoint.includes('staff-wise') ? 'staff_wise_duty.csv' : endpoint.includes('date-wise') ? 'date_wise_duty.csv' : 'day_wise_duty.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading file:', error);
            setMessage('Error downloading file: ' + error.message);
        }
    };

    return (
        <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="csvFile" className="block text-sm font-medium text-gray-700">
                        Exam Schedule Upload
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
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                    {loading ? 'Processing...' : 'Upload and Process CSV'}
                </button>
            </form>
            {message && (
                <div className={`mt-4 text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                    {message}
                </div>
            )}
            <div className="mt-4 space-y-2">
                <button
                    onClick={() => handleDownload('/schedule/date-wise-duties')}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                    Download Date-wise Duties
                </button>
                <button
                    onClick={() => handleDownload('/schedule/staff-wise-duties')}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                    Download Staff-wise Duties
                </button>

                <button
                    onClick={() => handleDownload('/schedule/day-wise-duties')}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                    Final report template
                </button>
            </div>
        </div>
    );
};

export default COEUpload;