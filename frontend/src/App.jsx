import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import City from './pages/City';
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
      </Routes>
    </div>
  );
}

export default App;
