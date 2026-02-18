import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { AdminLayout } from './components/admin/AdminLayout';

const queryClient = new QueryClient();

import React from 'react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

import ContentMessages from './pages/ContentMessages';
import ContentTestimonials from './pages/ContentTestimonials';
import ContentBlog from './pages/ContentBlog';

import Finance from './pages/Finance';
import CalendarPage from './pages/Calendar';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected Admin Routes with Layout */}
            <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/admin/finance" element={<Finance />} />
              <Route path="/admin/calendar" element={<CalendarPage />} />
              <Route path="/messages" element={<ContentMessages />} />
              <Route path="/testimonials" element={<ContentTestimonials />} />
              <Route path="/blog" element={<ContentBlog />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
