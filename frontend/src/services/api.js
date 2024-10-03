import axios from 'axios';

const api = {
    getEmployees: async () => {
        try {
            const response = await axios.get('/');
            return response.data;
        } catch (error) {
            console.error('Error fetching employees:', error);
            throw error;
        }
    },

    updateUnavailability: async (employeeId, unavailableDates) => {
        try {
            const response = await axios.put('http://localhost:5000/employees', {
                employeeId,
                unavailableDates
            });
            return response.data;
        } catch (error) {
            alert(error.response.data.message)
            console.error('Error updating unavailability:', error);
            throw error;
        }
    }
};

export default api;