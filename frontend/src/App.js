import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './components/Home';
import COEUpload from './components/COEUpload';
import CsvUpload from './components/CsvUpload';
import DbPopulate from './components/Databasepop';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/coe" element={<COEUpload />} />
        <Route path="/csv" element={<CsvUpload />} />
        <Route path="/" element={<DbPopulate />} />
      </Routes>
    </Router>
  );
}

export default App;