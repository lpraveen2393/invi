import React, { useState } from 'react';
import axios from 'axios';
/* 
   Gets the COE (Controller of Examinations) schedule for the exams as input, 
   processes the data, and allows the processed file to be downloaded from here.
   
   refer the input csv file/examDuties.csv for the format of the csv file.
*/

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
            const response = await axios.get(`http://localhost:5000/schedule${endpoint}`, {
                responseType: 'blob',
            });

            const filenameMap = {
                '/exam-duties-date': 'duties_by_date.csv',
                '/faculty-duty-summary': 'faculty_duty_summary.csv',
                '/final-duty-report': 'final_duty_report.csv',
                '/individual-faculty-duties': 'individual_faculty_duties.csv'
            };

            const filename = filenameMap[endpoint] || 'duty_report.csv';
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading file:', error);
            setMessage('Error downloading file: ' + error.message);
        }
    };
    // can use a map function to map four buttons and its endpoints to avoid repetition
    return (
        <div className="p-6 max-w-7xl mx-auto bg-white rounded-xl shadow-md text-center">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="csvFile" className="block text-lg font-bold text-blue-800 mb-2">
                        Upload the Exam Schedule
                    </label>
                    <input
                        type="file"
                        id="csvFile"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="mt-1 block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-lg file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-500 file:text-white
                            hover:file:bg-blue-800 cursor-pointer"
                    />
                </div>
                <button
                    type="submit"
                    disabled={!file || loading}
                    className="w-full md:w-auto inline-block px-6 py-2 bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 disabled:bg-gray-400"
                >
                    {loading ? 'Processing...' : 'Upload and Process CSV'}
                </button>
            </form>

            {message && (
                <div className={`mt-4 text-sm ${message.includes('Error') ? 'text-red-800' : 'text-green-700'}`}>
                    {message}
                </div>
            )}

            <div className="mt-10 pt-6 border-t border-gray-300">
                <h2 className="text-md font-semibold text-blue-800 mb-4">Download Reports</h2>
                <div className="flex flex-nowrap justify-center gap-4 overflow-x-auto">
                    .

                    <button
                        onClick={() => handleDownload('/exam-duties-date')}
                        className="min-w-fit px-4 py-2 bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:bg-blue-800"
                    >
                        Download Duties by Date
                    </button>
                    <button
                        onClick={() => handleDownload('/faculty-duty-summary')}
                        className="min-w-fit px-4 py-2 bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:bg-blue-800"
                    >
                        Download Faculty Summary
                    </button>
                    <button
                        onClick={() => handleDownload('/final-duty-report')}
                        className="min-w-fit px-4 py-2 bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:bg-blue-800"
                    >
                        Download Final Report
                    </button>
                    <button
                        onClick={() => handleDownload('/individual-faculty-duties')}
                        className="min-w-fit px-4 py-2 bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:bg-blue-800"
                    >
                        Download Individual Duties
                    </button>
                </div>
            </div>
        </div>
    );
};

export default COEUpload;
