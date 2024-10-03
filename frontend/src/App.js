import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './components/Home';
import FileUpload from './components/FileUpload';
import CsvUpload from './components/CsvUpload';;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/coe" element={<FileUpload />} />
        <Route path="/csv" element={<CsvUpload />} />
      </Routes>
    </Router>
  );
}

export default App;