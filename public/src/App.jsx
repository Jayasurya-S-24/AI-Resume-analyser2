import { Routes, Route, Navigate } from 'react-router-dom'; // Added Navigate
import DashboardLayout from './components/dashboard/Dashboard';
import AuthPage from './components/auth/Authentication';
import TopNotchPage from './pages/TopNotchPage';
import FormUpload from './components/dashboard/FormUpload';
import SearchPage from './pages/SearchPage';
import TemplatePage from './pages/TemplatePage';
import './App.css';
import DashboardContent from './components/dashboard/DashboardContent';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      {/* All Dashboard routes use DashboardLayout */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route path="content" element={<DashboardContent />} />
        <Route path="upload" element={<FormUpload />} />
        <Route path="topnotch" element={<TopNotchPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="template" element={<TemplatePage />} />
        {/* Redirect /dashboard to /dashboard/content */}
        <Route path="" element={<Navigate to="content" replace />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;