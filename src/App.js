// Вместо Route используйте Routes
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapComponent from './MapComponent';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/map" element={<MapComponent/>} />
      </Routes>
    </Router>
  );
}

export default App;

