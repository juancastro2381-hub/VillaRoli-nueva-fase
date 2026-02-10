import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

import ContentMessages from './pages/ContentMessages';
import ContentTestimonials from './pages/ContentTestimonials';
import ContentBlog from './pages/ContentBlog';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><ContentMessages /></ProtectedRoute>} />
          <Route path="/testimonials" element={<ProtectedRoute><ContentTestimonials /></ProtectedRoute>} />
          <Route path="/blog" element={<ProtectedRoute><ContentBlog /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
