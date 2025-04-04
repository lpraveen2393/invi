import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import IndividualUnavailable from './components/IndiUnavail';
import DutyAssign from './components/DutyAssign';
import Unavailable from './components/UnavailDates';
import DbPopulate from './components/DbPopulate';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<DbPopulate />} />
        <Route path="/unavail-individual" element={<IndividualUnavailable />} />
        <Route path="/coe" element={<DutyAssign />} />
        <Route path="/unavailable" element={<Unavailable />} />
      </Routes>
    </Router>
  );
}

export default App;