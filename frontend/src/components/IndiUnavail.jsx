import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import api from '../services/api';
import "../styles/home.css"

const Home = () => {
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate(); // Initialize navigate

    const handleEmployeeChange = (event) => {
        setSelectedEmployee(event.target.value);
    };

    const handleDateChange = (date) => {
        if (date && !unavailableDates.some(d => d.getTime() === date.getTime())) {
            setUnavailableDates([...unavailableDates, date]);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedEmployee || unavailableDates.length === 0) {
            alert('Please enter an employee ID and select at least one date.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formattedDates = unavailableDates.map(date => date.toISOString());
            console.log(formattedDates);

            await api.updateUnavailability(selectedEmployee, formattedDates);
            alert('Unavailability dates updated successfully!');
            setUnavailableDates([]);
            setSelectedEmployee('');
        } catch (error) {
            console.error('Error updating unavailability:', error);
            setError('Failed to update unavailability dates. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Button handler to navigate to FileUpload page
    const handleCOEClick = () => {
        navigate('/coe');
    };

    return (
        <div className="container">
            <h1>Update Employee Unavailability</h1>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="employee">Enter Employee ID:</label>
                    <input
                        type="text"
                        id="employee"
                        value={selectedEmployee}
                        onChange={handleEmployeeChange}
                        placeholder="Enter employee ID"
                    />
                </div>
                <div>
                    <label>Select Unavailable Dates:</label>
                    <DatePicker
                        selected={null}
                        onChange={handleDateChange}
                        minDate={new Date()}
                        inline
                        highlightDates={unavailableDates}
                        monthsShown={2}
                    />
                </div>
                <div>
                    <h3>Selected Dates:</h3>
                    <ul>
                        {unavailableDates.map((date, index) => (
                            <li key={index}>{date.toDateString()}</li>
                        ))}
                    </ul>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Updating...' : 'Update Unavailability'}
                </button>
            </form>


            <button
                onClick={handleCOEClick}
                className="coe">
                COE
            </button>
        </div>
    );
};

export default Home;
