import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
// import { StarGazer } from './pages/PlaceholderPages'; // Unused
import { PlaceholderPage } from './pages/PlaceholderPages';
// import { GalleryUI } from './components/GalleryUI'; // Removed route usage

import { Events } from './pages/Events';
import { Weather } from './pages/Weather';

import { DataProvider } from './context/DataContext';

function App() {
  return (
    <DataProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            {/* <Route path="gallery" element={<GalleryUI />} /> */}
            {/* Sidebar Routes */}
            <Route path="star-gazer" element={<Events />} /> {/* Star Gazer = Sky Events Dashboard (Events.tsx) */}
            <Route path="cosmic-weather" element={<Weather />} /> {/* Cosmic Weather = Placeholder (Weather.tsx) */}
            <Route path="mission-control" element={<PlaceholderPage title="Mission Control" subtitle="Launch Command" />} />
            <Route path="satellite-savior" element={<PlaceholderPage title="Satellite Savior" subtitle="Orbital Defense" />} />
            <Route path="academy" element={<PlaceholderPage title="The Academy" subtitle="Training Module" />} />

            {/* Hidden/Legacy Routes */}
            <Route path="events" element={<Events />} /> {/* Direct link if needed */}
            <Route path="tech" element={<PlaceholderPage title="Space Tech" subtitle="Innovation Hub" />} />
            <Route path="about" element={<PlaceholderPage title="About Project" subtitle="System Info" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;
