import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from '@components/layout/Layout';
import LoginPage from '@pages/LoginPage';
import RegisterPage from '@pages/RegisterPage';
import HomePage from '@pages/HomePage';
import AssetsPage from '@pages/AssetsPage';
import RiskAnalysisPage from '@pages/RiskAnalysisPage';
import ProfilePage from '@pages/ProfilePage';
import CalendarPage from '@pages/CalendarPage';
import StrategiesPage from '@pages/StrategiesPage';
import PsychoanalysisPage from '@pages/PsychoanalysisPage';

function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
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
          </RequireAuth>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
