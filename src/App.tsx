import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { queryClient } from './api/query-client';
import { AuthProvider } from './auth/AuthProvider';
import { RequireAuth } from './auth/RequireAuth';
import { ToastProvider } from './components/feedback/Toast';
import { AppShell } from './components/layout/AppShell';
import { AccountDetailPage } from './pages/AccountDetailPage';
import { AccountsPage } from './pages/AccountsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { MonthDetailPage } from './pages/MonthDetailPage';
import { RecurringRulesPage } from './pages/RecurringRulesPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/acceso" element={<LoginPage />} />
              <Route
                element={
                  <RequireAuth>
                    <AppShell />
                  </RequireAuth>
                }
              >
                <Route path="/" element={<DashboardPage />} />
                <Route path="/resumen" element={<DashboardPage />} />
                <Route path="/mes" element={<MonthDetailPage />} />
                <Route path="/cuentas" element={<AccountsPage />} />
                <Route path="/cuentas/:accountId" element={<AccountDetailPage />} />
                <Route path="/configuracion" element={<SettingsPage />} />
                <Route path="/configuracion/categorias" element={<CategoriesPage />} />
                <Route path="/configuracion/reglas" element={<RecurringRulesPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
