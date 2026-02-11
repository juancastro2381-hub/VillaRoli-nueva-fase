import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Alojamiento from "./pages/Alojamiento";
import Reservas from "./pages/Reservas";
import Pasadias from "./pages/Pasadias";
import Blog from "./pages/Blog";
import Contacto from "./pages/Contacto";
import Privacidad from "./pages/Privacidad";
import Terminos from "./pages/Terminos";
import NotFound from "./pages/NotFound";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import AdminBookings from "./pages/admin/Bookings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/alojamiento" element={<Alojamiento />} />
            <Route path="/alojamiento/pasadias" element={<Pasadias />} />
            <Route path="/reservas" element={<Reservas />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<Blog />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/privacidad" element={<Privacidad />} />
            <Route path="/terminos" element={<Terminos />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />

            {/* Admin Routes */}
            <Route path="/admin/bookings" element={<AdminBookings />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
