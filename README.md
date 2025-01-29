# Invi

Invi is a web application designed to allocate exam duties for staff members efficiently.

## Steps

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/invi.git
    cd invi
    ```

2. Install dependencies for both the backend and frontend:

    ```bash
    # Backend dependencies
    cd backend
    npm install

    # Frontend dependencies
    cd ../frontend
    npm install
    ```

## Running the Application

### Backend

1. Navigate to the `backend` directory:

    ```bash
    cd backend
    ```

2. Start the backend server:

    ```bash
    node server.js
    ```

   The backend server will run on `http://localhost:5000`.

### Frontend

1. Navigate to the `frontend` directory:

    ```bash
    cd ../frontend
    ```

2. Start the frontend application:

    ```bash
    npm start
    ```

   The frontend will be accessible at `http://localhost:3000`.

## Application Usage

1. **Home Page (`/`):**  
   - Create the database and collections.  
   - Upload employee data from `dbpopulate.csv`.

2. **Single Employee Updates (`/home`):**  
   - Allows an individual employee to update their unavailable dates.  
   - URL: `http://localhost:3000/home`

3. **Bulk Employee Updates (`/csv`):**  
   - Upload a CSV file (`unavailabledates(csv page).csv`) to update unavailable dates for multiple employees.  
   - URL: `http://localhost:3000/csv`

4. **COE Exam Schedule Updates (`/coe`):**  
   - Update the exam schedule using a CSV file (`examDuties.csv`) provided by the COE.  
   - URL: `http://localhost:3000/coe`

5. **Duty Assignment:**  
   - Duties are automatically assigned based on the input data.  
   - Multiple options for output download are provided: staff-wise, date-wise, and according to the COE final report template.

## Inputs

- `dbpopulate.csv`: Contains employee data for initial database population.
- `unavailabledates(csv page).csv`: A CSV file with unavailable dates for multiple employees.
- `examdateDuties.csv`: A CSV file containing exam schedule data from the COE.

## Outputs

- `date_wise_duty.csv`: Duties assigned based on date.
- `staff_wise_duty.csv`: Duties assigned per staff member.
- `day_wise_duty.csv`: Final report template according to COE requirements.

