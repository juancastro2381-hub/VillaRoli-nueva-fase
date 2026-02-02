import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Play, Users, BedDouble, Bath, Image } from "lucide-react";
import { Button } from "./button";

interface CabinTourProps {
  name: string;
  description: string;
  guests: number;
  beds: string;
  baths: number;
  features: string[];
  images: { src: string; alt: string }[];
  video?: string;
}

const CabinTour = ({
  name,
  description,
  guests,
  beds,
  baths,
  features,
  images,
  video,
}: CabinTourProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setShowVideo(false);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setShowVideo(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-card rounded-3xl overflow-hidden border border-border shadow-lg"
    >
      {/* Main Image with Video Play Button */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={images[0]?.src}
          alt={name}
          className="w-full h-full object-cover cursor-pointer transition-transform duration-500 hover:scale-105"
          onClick={() => openLightbox(0)}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        
        {/* Video Button */}
        {video && (
          <button
            onClick={() => {
              setShowVideo(true);
              setLightboxOpen(true);
            }}
            className="absolute top-4 right-4 bg-cta hover:bg-cta-dark text-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 z-10"
            aria-label="Ver tour virtual"
          >
            <Play size={24} fill="white" />
          </button>
        )}
        
        {/* Gallery Icon */}
        <button
          onClick={() => openLightbox(0)}
          className="absolute top-4 left-4 bg-black/60 hover:bg-black/80 text-white rounded-full px-4 py-2 shadow-lg transition-all duration-300 z-10 flex items-center gap-2"
        >
          <Image size={18} />
          <span className="text-sm font-medium">{images.length} fotos</span>
        </button>

        {/* Capacity Badge */}
        <div className="absolute bottom-4 left-4">
          <span className="inline-block px-4 py-2 bg-gold text-foreground font-bold rounded-full shadow-lg">
            {guests} personas
          </span>
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="flex gap-2 p-4 overflow-x-auto bg-secondary/50">
        {images.slice(0, 5).map((image, index) => (
          <button
            key={index}
            onClick={() => openLightbox(index)}
            className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-transparent hover:border-gold transition-all duration-300"
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
        {video && (
          <button
            onClick={() => {
              setShowVideo(true);
              setLightboxOpen(true);
            }}
            className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-cta bg-cta/20 flex items-center justify-center"
          >
            <Play size={24} className="text-cta" fill="currentColor" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6 md:p-8">
        <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
          {name}
        </h3>
        <p className="font-body text-muted-foreground text-lg leading-relaxed mb-6">
          {description}
        </p>

        {/* Stats */}
        <div className="flex flex-wrap gap-6 py-4 border-y border-border mb-6">
          <div className="flex items-center gap-2 text-foreground">
            <Users size={22} className="text-gold" />
            <span className="font-body font-medium">{guests} personas</span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <BedDouble size={22} className="text-gold" />
            <span className="font-body font-medium">{beds}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <Bath size={22} className="text-gold" />
            <span className="font-body font-medium">{baths} baño{baths > 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2">
          {features.map((feature) => (
            <span
              key={feature}
              className="px-3 py-1.5 bg-primary/10 text-foreground text-sm font-body rounded-full border border-primary/20"
            >
              {feature}
            </span>
          ))}
        </div>
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
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gold transition-colors z-50 p-2"
            >
              <X size={32} />
            </button>

            {showVideo && video ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-4xl mx-4"
              >
                <video
                  src={video}
                  controls
                  autoPlay
                  className="w-full rounded-lg shadow-2xl"
                />
              </motion.div>
            ) : (
              <>
                {/* Navigation */}
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

                {/* Main Image */}
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative max-w-5xl mx-4"
                >
                  <img
                    src={images[currentIndex]?.src}
                    alt={images[currentIndex]?.alt}
                    className="max-h-[80vh] w-auto mx-auto rounded-lg shadow-2xl"
                  />
                </motion.div>

                {/* Counter */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-lg font-body bg-black/50 px-4 py-2 rounded-full">
                  {currentIndex + 1} / {images.length}
                </div>

                {/* Thumbnails */}
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4 py-2">
                  {images.map((image, index) => (
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
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CabinTour;
