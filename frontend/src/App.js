import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './components/Home';
import COEUpload from './components/COEUpload';
import CsvUpload from './components/CsvUpload';;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/coe" element={<COEUpload />} />
        <Route path="/csv" element={<CsvUpload />} />
      </Routes>
    </Router>
  );
}

export default App;