import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Phone, MessageCircle, MapPin } from "lucide-react";
import poolNight from "@/assets/pool-night.jpg";

export function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={poolNight} alt="Piscina nocturna Villa Roli" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-primary/55 to-primary/40" />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <span className="inline-block px-4 py-2 bg-cta/20 rounded-full text-gold font-body text-sm tracking-wider uppercase mb-6">
              ¿Listo para escapar?
            </span>

            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-cream-light leading-tight">
              Tu próxima aventura 
              <span className="text-gold block mt-2">comienza aquí</span>
            </h2>

            <p className="font-body text-cream-light/80 text-lg mt-6 max-w-xl">
              Reserva ahora y asegura tu lugar en el paraíso. Piscinas, naturaleza y descanso te esperan en Villa Roli.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center lg:justify-start">
              <Button asChild size="lg" className="font-bold px-8 py-6 text-lg">
                <Link to="/reservas" className="flex items-center gap-2">
                  <Calendar size={20} />
                  Reservar Ahora
                </Link>
              </Button>
              <Button asChild size="lg" className="font-bold px-8 py-6 text-lg">
                <a
                  href="https://wa.me/573229726625?text=Hola,%20quiero%20información%20sobre%20Villa%20Roli"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <MessageCircle size={20} />
                  WhatsApp
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <Phone className="w-10 h-10 text-gold mb-4" />
              <h3 className="font-display text-xl font-semibold text-cream-light mb-2">
                Llámanos
              </h3>
              <p className="text-cream-light/70 font-body text-sm mb-3">
                Atención personalizada
              </p>
              <a href="https://wa.me/573229726625" target="_blank" rel="noopener noreferrer" className="text-gold font-semibold hover:underline">
                +57 322 972 6625
              </a>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <MessageCircle className="w-10 h-10 text-gold mb-4" />
              <h3 className="font-display text-xl font-semibold text-cream-light mb-2">
                WhatsApp
              </h3>
              <p className="text-cream-light/70 font-body text-sm mb-3">
                Respuesta inmediata
              </p>
              <a
                href="https://wa.me/573229726625"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold font-semibold hover:underline"
              >
                Escríbenos ahora
              </a>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 sm:col-span-2">
              <MapPin className="w-10 h-10 text-gold mb-4" />
              <h3 className="font-display text-xl font-semibold text-cream-light mb-2">
                Ubicación
              </h3>
              <a 
                href="https://www.google.com/maps?q=4.430722,-74.683056" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cream-light/70 font-body hover:text-gold transition-colors"
              >
                A 5 Km Vía Tocaima - Girardot, fácil acceso por carretera pavimentada.
                <span className="block mt-2 text-gold font-semibold">
                  📍 Tocaima, Cundinamarca
                </span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
