import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapComponent from './MapComponent';
import RegForm from './RegForm';
import LogForm from './LogForm';
import PrivateRoute from './PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LogForm />} />
        <Route path="/reg" element={<RegForm/>} />
        <Route exact path='/' element={<PrivateRoute/>}>
            <Route path="/map" element={<MapComponent/>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

