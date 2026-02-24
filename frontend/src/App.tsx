import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@components/layout/Layout';
import HomePage from '@pages/HomePage';
import AssetsPage from '@pages/AssetsPage';
import RiskAnalysisPage from '@pages/RiskAnalysisPage';
import ProfilePage from '@pages/ProfilePage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/risk" element={<RiskAnalysisPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
