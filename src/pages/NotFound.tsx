import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <section className="min-h-[80vh] flex items-center justify-center bg-secondary">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <span className="text-gold font-display text-9xl font-bold">404</span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-6">
              Página no encontrada
            </h1>
            <p className="font-body text-muted-foreground text-lg mt-4 mb-8">
              Parece que te has perdido en el bosque. Te ayudamos a encontrar el camino.
            </p>
            <Button asChild className="bg-gold hover:bg-gold/90 text-primary font-semibold">
              <Link to="/" className="flex items-center gap-2">
                <Home size={18} />
                Ir al Inicio
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
