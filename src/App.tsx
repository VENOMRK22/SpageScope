import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PlaceholderPage } from './pages/PlaceholderPages';
import { Events } from './pages/Events';
import { Weather } from './pages/Weather';
import { Launches } from './pages/Launches';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Home />} />
              <Route path="star-gazer" element={<Events />} />
              <Route path="cosmic-weather" element={<Weather />} />
              <Route path="mission-control" element={<Launches />} />
              <Route path="satellite-savior" element={<PlaceholderPage title="Satellite Savior" subtitle="Orbital Defense" />} />
              <Route path="academy" element={<PlaceholderPage title="The Academy" subtitle="Training Module" />} />

              {/* Legacy Routes */}
              <Route path="events" element={<Events />} />
              <Route path="tech" element={<PlaceholderPage title="Space Tech" subtitle="Innovation Hub" />} />
              <Route path="about" element={<PlaceholderPage title="About Project" subtitle="System Info" />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
