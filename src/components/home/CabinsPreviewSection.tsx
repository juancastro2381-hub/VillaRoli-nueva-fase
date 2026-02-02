import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, BedDouble, Bath, Home, Sun, CheckCircle, Clock } from "lucide-react";
import fincaVistaAerea from "@/assets/finca-vista-aerea2.jpg";
import pasadiaPiscina from "@/assets/pasadia-piscina1.jpg";

export function CabinsPreviewSection() {
  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-cta font-body text-sm tracking-wider uppercase">
            Opciones de Reserva
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-3">
            Elige Tu Experiencia
          </h2>
          <p className="font-body text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
            Dos formas de disfrutar Villa Roli: alquila toda la finca o ven por el día.
          </p>
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
            <Link to="/reservas" className="block h-full">
              <div className="bg-card rounded-3xl overflow-hidden border-2 border-gold hover:shadow-2xl hover:shadow-gold/20 transition-all duration-500 h-full flex flex-col">
                {/* Image */}
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={fincaVistaAerea}
                    alt="Finca Completa Villa Roli"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gold text-foreground font-bold text-xs rounded-full shadow-lg">
                      ⭐ EXCLUSIVO
                    </span>
                  </div>

                  {/* Price Tag */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-3">
                      <Home className="w-8 h-8 text-gold" />
                      <div>
                        <p className="text-cream-light/70 text-sm font-body">Desde</p>
                        <p className="text-cream-light font-display text-2xl font-bold">
                          <span className="text-gold">$55.000</span>
                          <span className="text-sm font-normal text-cream-light/70"> COP por persona / noche</span>
                        </p>
                        <p className="text-xs text-cream-light/50 font-body mt-0.5">Mínimo 10 personas</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 flex-1 flex flex-col">
                  <h3 className="font-display text-2xl font-bold text-foreground group-hover:text-cta transition-colors">
                    Finca Completa
                  </h3>

                  <p className="font-body text-muted-foreground leading-relaxed flex-1">
                    Alquila toda Villa Roli para ti y tu grupo. Incluye las 3 cabañas, todas las zonas comunes, piscinas y servicios exclusivos.
                  </p>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-2">
                    {["3 Cabañas", "37 Personas", "2 Piscinas", "Zonas verdes"].map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-gold shrink-0" />
                        <span className="font-body text-muted-foreground text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 pt-4 border-t border-border text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Users size={16} className="text-gold" />
                      <span className="text-sm font-medium">Hasta 37</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BedDouble size={16} className="text-gold" />
                      <span className="text-sm font-medium">14 camas</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Bath size={16} className="text-gold" />
                      <span className="text-sm font-medium">4 baños</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Pasadía */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="group"
          >
            <Link to="/reservas" className="block h-full">
              <div className="bg-card rounded-3xl overflow-hidden border border-border hover:border-cta/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cta/10 h-full flex flex-col">
                {/* Image */}
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={pasadiaPiscina}
                    alt="Pasadía en Villa Roli"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-cta text-white font-bold text-xs rounded-full shadow-lg">
                      ☀️ PLAN DEL DÍA
                    </span>
                  </div>

                  {/* Price Tag */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-3">
                      <Sun className="w-8 h-8 text-gold" />
                      <div>
                        <p className="text-cream-light/70 text-sm font-body">Por persona</p>
                        <p className="text-cream-light font-display text-2xl font-bold">
                          <span className="text-gold">$25.000</span>
                          <span className="text-sm font-normal text-cream-light/70"> COP</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 flex-1 flex flex-col">
                  <h3 className="font-display text-2xl font-bold text-foreground group-hover:text-cta transition-colors">
                    Pasadía
                  </h3>

                  <p className="font-body text-muted-foreground leading-relaxed flex-1">
                    Disfruta un día completo sin hospedarte. Acceso a piscinas, zonas verdes, zona BBQ y todas las áreas comunes.
                  </p>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-2">
                    {["2 Piscinas", "Zonas verdes", "Zona BBQ", "Parqueadero"].map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-gold shrink-0" />
                        <span className="font-body text-muted-foreground text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 pt-4 border-t border-border text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock size={16} className="text-gold" />
                      <span className="text-sm font-medium">8AM - 5PM</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={16} className="text-gold" />
                      <span className="text-sm font-medium">Sin límite</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12 space-y-6"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="font-semibold px-8"
            >
              <Link to="/reservas">Reservar Ahora</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8"
            >
              <Link to="/alojamiento">Ver Más Detalles</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}