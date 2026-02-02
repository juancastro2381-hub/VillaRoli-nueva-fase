import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown, Phone } from "lucide-react";
import fincaVistaAerea from "@/assets/finca-vista-aerea4.jpg";

export function HeroSection() {
  return (
    <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div className="absolute inset-0">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={fincaVistaAerea}
          alt="Villa Roli - Finca de recreación con piscina y cabañas"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />
      </div>

      {/* Floating Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute top-1/4 right-10 hidden lg:block"
      >
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
          <p className="text-cream-light font-body text-sm">⭐ 4.9/5 en Google</p>
          <p className="text-cream-light/70 text-xs mt-1">+200 reseñas</p>
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 container-custom text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="space-y-8"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="inline-block px-6 py-3 bg-cta/20 backdrop-blur-sm rounded-full text-gold font-body text-sm tracking-wider uppercase border border-cta/30"
          >
            🌴 Finca de Recreación y Turismo
          </motion.span>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-cream-light leading-tight">
            Tu paraíso
            <br />
            <span className="text-gold relative">
              tropical
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute bottom-2 left-0 h-2 bg-gold/30 -z-10"
              />
            </span>
          </h1>

          <p className="font-body text-lg md:text-xl lg:text-2xl text-cream-light/90 max-w-3xl mx-auto leading-relaxed">
            Piscinas, sol y naturaleza. Escápate y vive momentos inolvidables en Villa Roli.
            <span className="text-gold font-semibold"> Escápate y vive momentos inolvidables </span>
            en Villa Roli.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          >
            <Button
              asChild
              size="lg"
              className="font-bold px-10 py-7 text-lg hover:scale-105"
            >
              <Link to="/reservas">🏠 Reservar</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-2 border-cream-light/50 text-cream-light hover:bg-cream-light hover:text-primary px-10 py-7 text-lg"
            >
              <Link to="/reservas">☀️ Pasadía desde $25.000</Link>
            </Button>
          </motion.div>

          {/* Quick Contact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="flex items-center justify-center gap-6 pt-6"
          >
            <a
              href="tel:+573229726625"
              className="flex items-center gap-2 text-cream-light/80 hover:text-gold transition-colors"
            >
              <Phone size={18} />
              <span className="font-body text-sm">+57 322 972 6625</span>
            </a>
            <span className="text-cream-light/40">|</span>
            <a
              href="https://wa.me/573229726625"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-cream-light/80 hover:text-gold transition-colors"
            >
              <span className="font-body text-sm">💬 WhatsApp</span>
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="text-cream-light/60 flex flex-col items-center gap-2"
        >
          <span className="text-xs font-body tracking-wider uppercase">Descubre más</span>
          <ChevronDown size={28} />
        </motion.div>
      </motion.div>

      {/* Decorative gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}