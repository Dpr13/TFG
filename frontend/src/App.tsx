import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@components/layout/Layout';
import HomePage from '@pages/HomePage';
import AssetsPage from '@pages/AssetsPage';
import RiskAnalysisPage from '@pages/RiskAnalysisPage';
import ProfilePage from '@pages/ProfilePage';
import CalendarPage from '@pages/CalendarPage';
import StrategiesPage from '@pages/StrategiesPage';
import PsychoanalysisPage from '@pages/PsychoanalysisPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/risk" element={<RiskAnalysisPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/strategies" element={<StrategiesPage />} />
          <Route path="/psychoanalysis" element={<PsychoanalysisPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
