import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Detail } from './pages/Detail';
import { TemplatePage } from './pages/Template';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checklist/:id" element={<Detail />} />
        <Route path="/templates" element={<TemplatePage />} />
      </Routes>
    </Router>
  );
}

export default App;
