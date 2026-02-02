import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Users, BedDouble, Bath, CheckCircle, Clock, Sun, Home, Waves } from "lucide-react";
import CabinTour from "@/components/ui/CabinTour";
import PasadiaSection from "@/components/ui/PasadiaSection";

import { CABINS } from "@/data/cabins";
import { HORA_ADICIONAL, DEPOSITO_GARANTIA } from "@/lib/pricing";

// Finca Completa hero
import fincaVistaAerea from "@/assets/finca-vista-aerea2.jpg";
import pasadiaPiscina from "@/assets/pasadia-piscina1.jpg";

// Servicios incluidos en Finca Completa
const serviciosFincaCompleta = [
  "Acceso a las 3 cabañas",
  "Piscina para adultos",
  "Piscina para niños",
  "Zonas verdes",
  "Parqueadero privado",
  "Zona BBQ",
  "WiFi disponible",
];

const Alojamiento = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={fincaVistaAerea}
            alt="Alojamiento en Villa Roli"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
        </div>

        <div className="relative z-10 container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 bg-cta/20 backdrop-blur-sm rounded-full text-gold font-body text-sm tracking-wider uppercase mb-4">
              Alojamiento
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-cream-light">
              Alojamiento en Villa Roli
            </h1>
            <p className="font-body text-cream-light/80 text-lg mt-4 max-w-2xl mx-auto">
              Dos opciones para disfrutar: alquila toda la finca o ven por el día.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Opciones de Reserva - Resumen */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-cta font-body text-sm tracking-wider uppercase">
              Elige tu experiencia
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-3">
              Nuestras Opciones de Reserva
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Finca Completa */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group"
            >
              <div className="bg-card rounded-3xl overflow-hidden border-2 border-gold shadow-2xl h-full flex flex-col">
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={fincaVistaAerea}
                    alt="Finca Completa Villa Roli"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="inline-block px-4 py-2 bg-gold text-foreground font-bold rounded-full shadow-lg">
                      ⭐ OPCIÓN EXCLUSIVA
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2">
                      <Home className="w-8 h-8 text-gold" />
                      <h3 className="font-display text-3xl font-bold text-cream-light">
                        Finca Completa
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <p className="font-body text-muted-foreground text-lg leading-relaxed mb-6">
                    Alquila toda Villa Roli para ti y tu grupo. Incluye las 3 cabañas con capacidad total para <strong className="text-foreground">hasta 37 personas</strong>, todas las zonas comunes, piscinas y servicios exclusivos.
                  </p>

                  {/* Capacidad total */}
                  <div className="flex flex-wrap gap-6 py-4 border-y border-border mb-6">
                    <div className="flex items-center gap-2 text-foreground">
                      <Users size={22} className="text-gold" />
                      <span className="font-body font-medium">Hasta 37 Personas</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <BedDouble size={22} className="text-gold" />
                      <span className="font-body font-medium">3 Cabañas</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <Bath size={22} className="text-gold" />
                      <span className="font-body font-medium">5 Baños</span>
                    </div>
                  </div>

                  {/* Incluye */}
                  <div className="space-y-3 mb-6 flex-1">
                    <p className="font-display font-semibold text-foreground">Incluye:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {serviciosFincaCompleta.map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-gold shrink-0" />
                          <span className="font-body text-muted-foreground text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Precio y CTA */}
                  <div className="bg-primary rounded-2xl p-6 text-center mb-6">
                    <p className="text-cream-light/80 font-body text-sm mb-1">Desde</p>
                    <p className="font-display text-4xl font-bold text-gold">$55.000 COP</p>
                    <p className="text-cream-light/60 font-body text-sm mt-1">por persona / noche (mín. 10 personas)</p>
                  </div>

                  <Button asChild size="lg" className="w-full font-bold py-6 text-lg">
                    <Link to="/reservas">Reservar Finca Completa</Link>
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Pasadía */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="group"
            >
              <div className="bg-card rounded-3xl overflow-hidden border border-border hover:border-cta/50 transition-all duration-500 h-full flex flex-col">
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={pasadiaPiscina}
                    alt="Pasadía en Villa Roli"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="inline-block px-4 py-2 bg-cta text-white font-bold rounded-full shadow-lg">
                      ☀️ PLAN DEL DÍA
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2">
                      <Sun className="w-8 h-8 text-gold" />
                      <h3 className="font-display text-3xl font-bold text-cream-light">
                        Pasadía
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <p className="font-body text-muted-foreground text-lg leading-relaxed mb-6">
                    Disfruta un día completo en Villa Roli sin hospedarte. Acceso a piscinas, zonas verdes, zona BBQ y todas las áreas comunes. Ideal para celebraciones y paseos familiares.
                  </p>

                  {/* Info rápida */}
                  <div className="flex flex-wrap gap-6 py-4 border-y border-border mb-6">
                    <div className="flex items-center gap-2 text-foreground">
                      <Clock size={22} className="text-gold" />
                      <span className="font-body font-medium">8:00 AM - 5:00 PM</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <Users size={22} className="text-gold" />
                      <span className="font-body font-medium">Sin límite de personas</span>
                    </div>
                  </div>

                  {/* Incluye */}
                  <div className="space-y-3 mb-6 flex-1">
                    <p className="font-display font-semibold text-foreground">Incluye:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {["Piscina adultos", "Piscina niños", "Zona BBQ", "Zonas verdes", "Parqueadero", "Baños y duchas"].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-gold shrink-0" />
                          <span className="font-body text-muted-foreground text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Precio y CTA */}
                  <div className="bg-secondary rounded-2xl p-6 text-center mb-6">
                    <p className="text-muted-foreground font-body text-sm mb-1">Por persona</p>
                    <p className="font-display text-4xl font-bold text-gold">$25.000 COP</p>
                    <p className="text-muted-foreground font-body text-sm mt-1">Niños menores de 3 años gratis</p>
                  </div>

                  <Button asChild size="lg" className="w-full font-bold py-6 text-lg">
                    <Link to="/reservas">Reservar Pasadía</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Distribución de la Finca - Tours Virtuales de Cabañas */}
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
              Distribución de la Finca
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3">
              Nuestras Acomodaciones
            </h2>
            <p className="font-body text-muted-foreground mt-4 max-w-2xl mx-auto">
              Al reservar la Finca Completa, tendrás acceso a las 3 cabañas con capacidad total para 37 personas. Explora cada una con nuestros tours virtuales.
            </p>
          </motion.div>

          {/* Cabin Tours */}
          <div className="space-y-10">
            {CABINS.map((cabin, index) => (
              <motion.div
                key={cabin.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <CabinTour
                  name={cabin.name}
                  description={cabin.description}
                  guests={cabin.guests}
                  beds={cabin.beds}
                  baths={cabin.baths}
                  features={cabin.features}
                  images={cabin.images}
                  video={cabin.video}
                />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <p className="font-body text-muted-foreground mb-4">
              Todas las cabañas están incluidas al reservar la Finca Completa.
            </p>
            <Button asChild size="lg" className="font-bold px-10">
              <Link to="/reservas">Reservar Finca Completa</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Horas Extras Section */}
      <section className="py-24 bg-secondary/20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
          <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] bg-gold/10 rounded-full blur-3xl" />
          <div className="absolute top-[30%] -left-[10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gold/20 text-gold mb-6 shadow-sm">
              <Clock className="w-4 h-4" />
              <span className="font-body text-xs font-bold tracking-widest uppercase">Tiempo Adicional</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Horas Extras
            </h2>
            <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
              Extiende tu estadía con flexibilidad. Solicita check-in temprano o check-out tarde.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Tier 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-border flex flex-col group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="w-14 h-14 mb-6 rounded-2xl bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform duration-300">
                <Users className="w-7 h-7" />
              </div>

              <div className="flex-1">
                <h3 className="font-display text-xl font-bold text-foreground mb-2">Grupo Pequeño</h3>
                <p className="font-body text-sm text-muted-foreground mb-6">Hasta 10 personas</p>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-display text-4xl font-bold text-primary">$50.000</span>
                  <span className="font-body text-sm text-muted-foreground">/ hora</span>
                </div>
                <p className="font-body text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg inline-block">
                  Aplica también para Plan Familia
                </p>
              </div>
            </motion.div>

            {/* Tier 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-primary text-primary-foreground rounded-3xl p-8 shadow-2xl hover:shadow-primary/30 transition-all duration-300 border border-primary flex flex-col group relative overflow-hidden transform md:-translate-y-4"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sun className="w-24 h-24 rotate-12" />
              </div>

              <div className="w-14 h-14 mb-6 rounded-2xl bg-white/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                <Users className="w-7 h-7" />
              </div>

              <div className="flex-1 relative z-10">
                <h3 className="font-display text-xl font-bold text-white mb-2">Grupo Mediano</h3>
                <p className="font-body text-sm text-primary-foreground/70 mb-6">11 a 30 personas</p>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-display text-4xl font-bold text-white">$70.000</span>
                  <span className="font-body text-sm text-primary-foreground/70">/ hora</span>
                </div>
                <p className="font-body text-xs text-primary-foreground/60">
                  Tarifa estándar para grupos
                </p>
              </div>
            </motion.div>

            {/* Tier 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-border flex flex-col group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="w-14 h-14 mb-6 rounded-2xl bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform duration-300">
                <Users className="w-7 h-7" />
              </div>

              <div className="flex-1">
                <h3 className="font-display text-xl font-bold text-foreground mb-2">Grupo Grande</h3>
                <p className="font-body text-sm text-muted-foreground mb-6">31+ personas</p>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-display text-4xl font-bold text-primary">$100.000</span>
                  <span className="font-body text-sm text-muted-foreground">/ hora</span>
                </div>
                <p className="font-body text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg inline-block">
                  Para eventos o grupos grandes
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center mt-12 bg-white/50 backdrop-blur-sm border border-border rounded-xl p-4 max-w-xl mx-auto"
          >
            <p className="font-body text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-gold" />
              <span>Sujeto a disponibilidad. Consulta al momento de tu reserva.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pasadía Section */}
      <div id="pasadia">
        <PasadiaSection />
      </div>

      {/* Bottom CTA */}
      <section className="py-16 bg-primary">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-cream-light mb-4">
              ¿Listo para reservar?
            </h2>
            <p className="font-body text-cream-light/80 text-lg max-w-xl mx-auto mb-8">
              Contáctanos ahora y asegura tu experiencia en Villa Roli
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="font-bold px-10"
              >
                <Link to="/reservas">Reservar Ahora</Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="font-bold px-10"
              >
                <a href="https://wa.me/573229726625" target="_blank" rel="noopener noreferrer">
                  💬 WhatsApp
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Alojamiento;
