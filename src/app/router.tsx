import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '../layout/AppShell';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { RunsPage } from '../pages/runs/RunsPage';
import { RunDetailsPage } from '../pages/runs/RunDetailsPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="runs" element={<RunsPage />} />
          <Route path="runs/:runId" element={<RunDetailsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}