import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import PublicLayout from './layouts/PublicLayout';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminLevels from './pages/admin/Levels';
import AdminGroups from './pages/admin/Groups';
import AdminModules from './pages/admin/Modules';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminFiles from './pages/admin/Files';
import AdminSettings from './pages/admin/Settings';

// Public Pages
import Home from './pages/public/Home';
import LevelGroups from './pages/public/LevelGroups';
import GroupModules from './pages/public/GroupModules';
import ModuleDetails from './pages/public/ModuleDetails';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/level/:levelId" element={<LevelGroups />} />
          <Route path="/group/:groupId" element={<GroupModules />} />
          <Route path="/module/:moduleId" element={<ModuleDetails />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="levels" element={<AdminLevels />} />
          <Route path="groups" element={<AdminGroups />} />
          <Route path="modules" element={<AdminModules />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="files" element={<AdminFiles />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
