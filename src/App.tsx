import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { UserProfile } from './pages/UserProfile';
import { CareerTimeline } from './pages/CareerTimeline';
import { CareerLedger } from './pages/CareerLedger';
import { Analysis } from './pages/Analysis';
import { ResumeExport } from './pages/ResumeExport';
import { Settings } from './pages/Settings';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/ledger" element={<CareerLedger />} />
            <Route path="/career" element={<CareerTimeline />} />
            <Route path="/compensation" element={<Navigate to="/ledger" replace />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/resume" element={<ResumeExport />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;

