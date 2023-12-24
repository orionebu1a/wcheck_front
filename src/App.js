// Вместо Route используйте Routes
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Registration from './Registration'; // Проверьте импорты
import AddLocation from './AddLocation'; // Проверьте импорты
import AddFeedback from './AddFeedback';

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/registration" element={<Registration />} /> */}
        {/* <Route path="/add-location" element={<AddLocation />} /> */}
        <Route path="/add-feedback" element={<AddFeedback />} />
      </Routes>
    </Router>
  );
}

export default App;

