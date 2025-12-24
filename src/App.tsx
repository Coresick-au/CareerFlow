import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { UserProfile } from './pages/UserProfile';
import { CareerTimeline } from './pages/CareerTimeline';
import { Compensation } from './pages/Compensation';
import { Analysis } from './pages/Analysis';
import { ResumeExport } from './pages/ResumeExport';
import { Settings } from './pages/Settings';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/career" element={<CareerTimeline />} />
        <Route path="/compensation" element={<Compensation />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/resume" element={<ResumeExport />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}

export default App;
