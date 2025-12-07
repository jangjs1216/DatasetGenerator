import { Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './layout/RootLayout';
import ProjectsPage from './routes/ProjectsPage';
import AssetsPage from './routes/AssetsPage';
import InsightsPage from './routes/InsightsPage';
import ExportsPage from './routes/ExportsPage';

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<Navigate to="/projects" replace />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId/assets" element={<AssetsPage />} />
        <Route path="/projects/:projectId/insights" element={<InsightsPage />} />
        <Route path="/projects/:projectId/exports" element={<ExportsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
