import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapComponent from './MapComponent';
import RegForm from './RegForm';
import LogForm from './LogForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/map" element={<MapComponent/>} />
        <Route path="/reg" element={<RegForm/>} />
        <Route path="/login" element={<LogForm/>} />
      </Routes>
    </Router>
  );
}

export default App;

