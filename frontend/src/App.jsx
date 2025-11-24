import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import City from './pages/City';
import CreatePage from './pages/CreatePage';
import PageDetail from './pages/PageDetail';
import './App.css';

function App() {
  return (
    <div className="app">
      <header>
        <h1>🌐 GeoCities AI</h1>
        <p>Where AI Content Lives</p>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/city/:id" element={<City />} />
        <Route path="/city/:cityId/create-page" element={<CreatePage />} />
        <Route path="/city/:cityId/page/:pageId" element={<PageDetail />} />
      </Routes>
    </div>
  );
}

export default App;
