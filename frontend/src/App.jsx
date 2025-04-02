import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import IndividualUnavailable from './components/IndiUnavail';
import DutyAssign from './components/DutyAssign';
import Unavailable from './components/UnavailDates';
import DbPopulate from './components/DbPopulate';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/unavail-individual" element={<IndividualUnavailable />} />
        <Route path="/coe" element={<DutyAssign />} />
        <Route path="/unavailable" element={<Unavailable />} />
        <Route path="/populate" element={<DbPopulate />} />
      </Routes>
    </Router>
  );
}

export default App;