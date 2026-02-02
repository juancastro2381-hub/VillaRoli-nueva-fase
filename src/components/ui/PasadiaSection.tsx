import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Clock, Users, Waves, Sun, CheckCircle, Image } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./button";

// Pasadía images
import pasadiaPiscina1 from "@/assets/pasadia-piscina1.jpg";
import pasadiaPiscina2 from "@/assets/pasadia-piscina2.jpg";
import pasadiaPiscina3 from "@/assets/pasadia-piscina3.jpg";
import pasadiaComedor from "@/assets/pasadia-comedor.jpg";
import pasadiaVistaAerea from "@/assets/pasadia-vista-aerea.jpg";
import pasadiaVistaAerea2 from "@/assets/pasadia-vista-aerea2.jpg";

const pasadiaImages = [
  { src: pasadiaPiscina1, alt: "Piscina principal Villa Roli" },
  { src: pasadiaPiscina2, alt: "Zona de piscina" },
  { src: pasadiaPiscina3, alt: "Piscina y jacuzzi" },
  { src: pasadiaComedor, alt: "Comedor al aire libre" },
  { src: pasadiaVistaAerea, alt: "Vista aérea de las instalaciones" },
  { src: pasadiaVistaAerea2, alt: "Vista aérea completa" },
];

const serviciosIncluidos = [
  "Piscina para adultos",
  "Piscina para niños",
  "Zonas verdes y jardines",
  "Parqueadero privado",
  "Zona BBQ disponible",
  "Sillas y mesas de descanso",
  "Baños y duchas",
];

const PasadiaSection = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? pasadiaImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === pasadiaImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-cta font-body text-sm tracking-wider uppercase">
            Plan del Día
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3">
            Pasadía en Villa Roli
          </h2>
          <p className="font-body text-muted-foreground mt-4 max-w-2xl mx-auto">
            Disfruta un día completo en nuestras instalaciones sin necesidad de hospedarte. Ideal para familias, amigos y celebraciones.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-card rounded-3xl overflow-hidden border border-cta/30 shadow-xl"
        >
          {/* Main Image Gallery */}
          <div className="relative h-72 md:h-96 overflow-hidden">
            <img
              src={pasadiaImages[0].src}
              alt={pasadiaImages[0].alt}
              className="w-full h-full object-cover cursor-pointer transition-transform duration-500 hover:scale-105"
              onClick={() => openLightbox(0)}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            
            {/* Gallery Icon */}
            <button
              onClick={() => openLightbox(0)}
              className="absolute top-4 left-4 bg-black/60 hover:bg-black/80 text-white rounded-full px-4 py-2 shadow-lg transition-all duration-300 z-10 flex items-center gap-2"
            >
              <Image size={18} />
              <span className="text-sm font-medium">{pasadiaImages.length} fotos</span>
            </button>

            <div className="absolute bottom-4 left-4 flex items-center gap-3">
              <Sun className="w-10 h-10 text-gold" />
              <h3 className="font-display text-3xl md:text-4xl font-bold text-cream-light">
                Pasadía
              </h3>
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="flex gap-2 p-4 overflow-x-auto bg-secondary/50">
            {pasadiaImages.map((image, index) => (
              <button
                key={index}
                onClick={() => openLightbox(index)}
                className="shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-transparent hover:border-gold transition-all duration-300"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 md:p-10">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Info Column */}
              <div>
                <p className="font-body text-muted-foreground text-lg leading-relaxed mb-6">
                  Disfruta de un día completo en Villa Roli sin hospedarte. Acceso a todas las zonas exteriores, piscinas para adultos y niños, zonas verdes, zona BBQ y más. Perfecto para paseos familiares, cumpleaños y celebraciones.
                </p>

                {/* Quick Info */}
                <div className="flex flex-wrap gap-6 py-4 border-y border-border mb-6">
                  <div className="flex items-center gap-2 text-foreground">
                    <Clock size={22} className="text-gold" />
                    <span className="font-body font-medium">8:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <Users size={22} className="text-gold" />
                    <span className="font-body font-medium">Sin límite de personas</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <Waves size={22} className="text-gold" />
                    <span className="font-body font-medium">Zonas exteriores</span>
                  </div>
                </div>

                {/* Services */}
                <div className="space-y-3">
                  <p className="font-display font-semibold text-foreground text-lg">Incluye:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {serviciosIncluidos.map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-gold shrink-0" />
                        <span className="font-body text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="font-body text-muted-foreground text-sm mt-6 italic">
                  Nota: El pasadía no incluye acceso a las cabañas, solo zonas exteriores.
                </p>
              </div>

              {/* Pricing Column */}
              <div className="space-y-6">
                {/* Pricing Card - Precio Único */}
                <div className="bg-gradient-to-br from-primary to-primary/90 rounded-2xl p-6 text-center">
                  <p className="text-cream-light/80 font-body text-sm mb-1">Precio Único</p>
                  <p className="font-display text-4xl font-bold text-gold">$25.000 COP</p>
                  <p className="text-cream-light/60 font-body text-sm mt-1">por persona</p>
                </div>

                <p className="text-center text-muted-foreground text-sm">
                  🎉 Niños menores de 3 años: <strong className="text-gold">Gratis</strong>
                </p>

                <Button asChild size="lg" className="w-full font-bold py-6 text-lg">
                  <Link to="/reservas">Reservar Pasadía</Link>
                </Button>

                <Button asChild size="lg" variant="outline" className="w-full font-bold py-6 text-lg border-cta text-cta hover:bg-cta hover:text-white">
                  <a href="https://wa.me/573229726625" target="_blank" rel="noopener noreferrer">
                    💬 Consultar por WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gold transition-colors z-50 p-2"
            >
              <X size={32} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 text-white hover:text-gold transition-colors p-2 z-50"
            >
              <ChevronLeft size={40} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 text-white hover:text-gold transition-colors p-2 z-50"
            >
              <ChevronRight size={40} />
            </button>

            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl mx-4"
            >
              <img
                src={pasadiaImages[currentIndex]?.src}
                alt={pasadiaImages[currentIndex]?.alt}
                className="max-h-[80vh] w-auto mx-auto rounded-lg shadow-2xl"
              />
            </motion.div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-lg font-body bg-black/50 px-4 py-2 rounded-full">
              {currentIndex + 1} / {pasadiaImages.length}
            </div>

            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4 py-2">
              {pasadiaImages.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  className={`shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${
                    index === currentIndex ? "border-gold" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default PasadiaSection;
