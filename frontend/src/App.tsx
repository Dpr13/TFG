import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from '@components/layout/Layout';
import LoginPage from '@pages/LoginPage';
import RegisterPage from '@pages/RegisterPage';
import VerifyEmailPage from '@pages/VerifyEmailPage';
import HomePage from '@pages/HomePage';
import AssetsPage from '@pages/AssetsPage';
import RiskAnalysisPage from '@pages/RiskAnalysisPage';
import RecommendationPage from '@pages/RecommendationPage';
import ProfilePage from '@pages/ProfilePage';
import CalendarPage from '@pages/CalendarPage';
import StrategiesPage from '@pages/StrategiesPage';
import PsychoanalysisPage from '@pages/PsychoanalysisPage';
import NewsPage from '@pages/NewsPage';
import ComparePage from '@pages/ComparePage';
import ForgotPasswordPage from '@pages/ForgotPasswordPage';
import ResetPasswordPage from '@pages/ResetPasswordPage';
import BotsPage from '@pages/BotsPage';

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
      <Route path="/verificar-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/assets" element={<AssetsPage />} />
                <Route path="/analisis" element={<RiskAnalysisPage />} />
                <Route path="/recommendation" element={<RecommendationPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/strategies" element={<StrategiesPage />} />
                <Route path="/psychoanalysis" element={<PsychoanalysisPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/comparar" element={<ComparePage />} />
                <Route path="/bots" element={<BotsPage />} />
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
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
