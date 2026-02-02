import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VillaRoliLogo } from "@/components/ui/VillaRoliLogo";

const navLinks = [
  { name: "Inicio", path: "/" },
  {
    name: "Alojamiento",
    path: "/alojamiento",
    submenu: [
      { name: "Finca Completa", path: "/alojamiento" },
      { name: "☀️ Pasadías", path: "/reservas" },
    ],
  },
  { name: "Reservas", path: "/reservas" },
  { name: "Blog", path: "/blog" },
  { name: "Contacto", path: "/contacto" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveSubmenu(null);
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-lg py-3"
          : "bg-transparent py-5"
        }`}
    >
      <div className="container-custom">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <VillaRoliLogo
                variant={isScrolled ? "dark" : "light"}
                showTagline={!isScrolled}
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() => link.submenu && setActiveSubmenu(link.name)}
                onMouseLeave={() => setActiveSubmenu(null)}
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link
                    to={link.path}
                    className={`font-body text-sm font-medium transition-colors duration-300 flex items-center gap-1 ${isScrolled
                        ? "text-foreground hover:text-cta"
                        : "text-cream-light/90 hover:text-cream-light"
                      } ${location.pathname === link.path ? "text-cta" : ""}`}
                  >
                    {link.name}
                    {link.submenu && <ChevronDown className="w-4 h-4" />}
                  </Link>
                </motion.div>

                {/* Submenu */}
                <AnimatePresence>
                  {link.submenu && activeSubmenu === link.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 pt-2"
                    >
                      <div className="bg-card rounded-xl shadow-2xl border border-border overflow-hidden min-w-[220px]">
                        {link.submenu.map((subLink, subIndex) => (
                          <Link
                            key={subLink.name}
                            to={subLink.path}
                            className={`block px-5 py-3.5 text-sm font-body text-foreground hover:bg-secondary hover:text-cta transition-colors ${subIndex === link.submenu!.length - 1 && subLink.name.includes("Pasadías")
                                ? "bg-gold/10 border-t border-border"
                                : ""
                              }`}
                          >
                            {subLink.name}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Button
                asChild
                className="font-semibold px-6"
              >
                <Link to="/reservas">Reservar</Link>
              </Button>
            </motion.div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden relative z-10 p-2 transition-colors ${isScrolled ? "text-foreground" : "text-cream-light"
              }`}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-background border-t border-border"
          >
            <div className="container-custom py-6 space-y-4">
              {navLinks.map((link) => (
                <div key={link.name}>
                  <Link
                    to={link.path}
                    className="block py-2 text-lg font-body text-foreground hover:text-cta transition-colors"
                  >
                    {link.name}
                  </Link>
                  {link.submenu && (
                    <div className="pl-4 space-y-2 mt-2 border-l-2 border-cta/30">
                      {link.submenu.map((subLink) => (
                        <Link
                          key={subLink.name}
                          to={subLink.path}
                          className="block py-1.5 text-muted-foreground hover:text-cta transition-colors"
                        >
                          {subLink.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Button
                asChild
                className="w-full font-semibold mt-4"
              >
                <Link to="/reservas">Reservar Ahora</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
