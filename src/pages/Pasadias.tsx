import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Waves,
  Sun,
  Utensils,
  Users,
  Clock,
  CheckCircle,
  Phone,
  Calendar,
  Info
} from "lucide-react";
import pasadiaPiscina from "@/assets/pasadia-piscina1.jpg";
import pasadiaVistaAerea from "@/assets/pasadia-vista-aerea.jpg";
import { PASADIA_PRICES, PASADIA_INFO, HORA_ADICIONAL, obtenerPrecioHoraAdicional } from "@/lib/pricing";

const opcionales = [
  { item: "Almuerzo típico", precio: "25.000 COP/persona" },
  { item: "Refrigerios y bebidas", precio: "Según consumo" },
  { item: "Alquiler zona BBQ", precio: "50.000 COP" },
  { item: "Decoración especial", precio: "Desde 80.000 COP" },
];

const Pasadias = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={pasadiaPiscina}
            alt="Pasadías en Villa Roli"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
        </div>

        <div className="relative z-10 container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <span className="inline-block px-4 py-2 bg-cta/20 backdrop-blur-sm rounded-full text-gold font-body text-sm tracking-wider uppercase">
              Disfruta sin hospedarte
            </span>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-cream-light">
              Pasadías en <span className="text-gold">Villa Roli</span>
            </h1>
            <p className="font-body text-lg md:text-xl text-cream-light/90 max-w-2xl mx-auto">
              Un día completo de diversión, descanso y naturaleza para ti y tu familia.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Info Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div>
                <span className="text-cta font-body text-sm tracking-wider uppercase">
                  Plan del día
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
                  ¿Qué incluye el Pasadía?
                </h2>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary rounded-2xl p-5 text-center">
                  <Clock className="w-8 h-8 text-gold mx-auto mb-2" />
                  <p className="font-body text-sm text-muted-foreground">Horario</p>
                  <p className="font-display font-semibold text-foreground">{PASADIA_INFO.horario}</p>
                </div>
                <div className="bg-secondary rounded-2xl p-5 text-center">
                  <Users className="w-8 h-8 text-gold mx-auto mb-2" />
                  <p className="font-body text-sm text-muted-foreground">Capacidad</p>
                  <p className="font-display font-semibold text-foreground">Sin límite de personas</p>
                </div>
              </div>

              {/* Included List */}
              <div className="space-y-3">
                <h3 className="font-display text-xl font-semibold text-foreground">
                  Incluido en la tarifa
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PASADIA_INFO.incluye.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-gold shrink-0" />
                      <span className="font-body text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prices */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-center">
                  <p className="text-cream-light/80 font-body text-sm mb-1">Precio Único por Persona</p>
                  <p className="font-display text-4xl font-bold text-gold">${PASADIA_PRICES.entreSemana.toLocaleString()} COP</p>
                  <p className="text-cream-light/60 font-body text-sm mt-2">Niños menores de 3 años gratis</p>
                </div>

                <div className="bg-secondary rounded-xl p-4 flex items-start gap-3">
                  <Info className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground mb-1">{PASADIA_INFO.nota}</p>
                    <p>Hora adicional (entrada temprana o salida tarde): desde <span className="text-gold font-semibold">${HORA_ADICIONAL.hasta10.toLocaleString()} COP</span></p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={pasadiaVistaAerea}
                  alt="Vista panorámica de Villa Roli"
                  className="w-full h-[500px] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex gap-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
                      <Waves className="w-8 h-8 text-gold" />
                      <div>
                        <p className="font-body text-cream-light text-sm">Piscinas</p>
                        <p className="font-display text-cream-light font-semibold">2 disponibles</p>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
                      <Sun className="w-8 h-8 text-gold" />
                      <div>
                        <p className="font-body text-cream-light text-sm">Clima</p>
                        <p className="font-display text-cream-light font-semibold">Cálido tropical</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Optional Services */}
      <section className="section-padding bg-secondary">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="text-cta font-body text-sm tracking-wider uppercase">
              Complementa tu experiencia
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
              Servicios Adicionales
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {opcionales.map((servicio, index) => (
              <motion.div
                key={servicio.item}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border hover:border-cta/50 transition-all duration-300 text-center"
              >
                <Utensils className="w-10 h-10 text-gold mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {servicio.item}
                </h3>
                <p className="font-body text-gold font-semibold">
                  {servicio.precio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-primary via-primary to-primary/90 rounded-3xl p-8 md:p-16 text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-cream-light mb-4">
              ¿Listo para un día de diversión?
            </h2>
            <p className="font-body text-cream-light/80 text-lg max-w-2xl mx-auto mb-8">
              Reserva tu pasadía y disfruta de un día inolvidable en Villa Roli con tu familia y amigos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="font-semibold px-8 py-6 text-lg"
              >
                <Link to="/reservas" className="flex items-center gap-2">
                  <Calendar size={20} />
                  Reservar Pasadía
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="font-semibold px-8 py-6 text-lg"
              >
                <Link to="/contacto" className="flex items-center gap-2">
                  <Phone size={20} />
                  Contáctanos
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Pasadias;
