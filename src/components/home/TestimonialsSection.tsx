import { motion } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight, MessageSquarePlus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const initialTestimonials = [
  {
    name: "Claudia Patricia",
    location: "Bogotá, Colombia",
    date: "Enero 2025",
    rating: 5,
    text: "Excelente nos sentimos muy tranquilos y cómodos",
    type: "En grupo",
    source: "Airbnb",
  },
  {
    name: "Ana Maria",
    location: "Bogotá, Colombia",
    date: "Abril 2025",
    rating: 5,
    text: "Lugar muy acogedor, la sra Miriam y Alberto muy pendiente, recomendado para disfrutar de las actividades que la finca ofrece, ya sea en familia o con amigos.",
    type: "Con mascota",
    source: "Airbnb",
  },
  {
    name: "Julián",
    location: "Bogotá, Colombia",
    date: "Mayo 2024",
    rating: 5,
    text: "El lugar muy bonito tal cual como se ve en las fotos, mi familia y yo la pasamos muy bien, el lugar muy tranquilo y privado lo recomiendo. Un saludo especial a la señora Miriam que fue muy cordial en todo momento.",
    type: "Con mascota",
    source: "Airbnb",
  },
  {
    name: "Fredy",
    location: "Bogotá, Colombia",
    date: "Julio 2022",
    rating: 5,
    text: "Super recomendado, la finca es muy linda, privado, a 10 minutos del pueblo, la piscina y la zona de asado espectacular, el anfitrión y la señora Miriam muy atentos, con seguridad volveremos.",
    type: "Con niños",
    source: "Airbnb",
  },
  {
    name: "Nicole",
    location: "6 años en Airbnb",
    date: "Julio 2022",
    rating: 5,
    text: "Alberto es un excelente anfitrión muy amable y responderá todas tus dudas sin duda el mejor.",
    type: "Estadía de una noche",
    source: "Airbnb",
  },
  {
    name: "Diana",
    location: "Bogotá, Colombia",
    date: "Junio 2022",
    rating: 5,
    text: "El lugar es muy bonito para el precio es amplio la piscina es grande y limpia es mucho mejor que en fotos.",
    type: "En grupo",
    source: "Airbnb",
  },
  {
    name: "Cesar",
    location: "Funza, Colombia",
    date: "Marzo 2022",
    rating: 5,
    text: "Realmente todo Genial, una experiencia maravillosa que sin duda repetiría! completamente recomendado este lugar para compartir en familia o con amigos ya que permite relajarse sin ruidos o incomodidades. El anfitrión es un amor!",
    type: "En grupo",
    source: "Airbnb",
  },
  {
    name: "Cesar",
    location: "Bogotá, Colombia",
    date: "Febrero 2022",
    rating: 5,
    text: "La mejor experiencia que he tenido, todo gracias a este lugar, no se arrepentirán.",
    type: "En grupo",
    source: "Airbnb",
  },
];

export function TestimonialsSection() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Form State
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch testimonials from API
    const fetchTestimonials = async () => {
      try {
        const res = await fetch("/api/content/testimonials");
        if (res.ok) {
          const data = await res.json();
          // Map backend fields to frontend
          const mapped = data.map((t: any) => ({
            name: t.name,
            location: t.city || "Viajero",
            date: new Date(t.created_at).toLocaleDateString(),
            rating: t.rating,
            text: t.comment,
            type: "Verificado",
            source: "Web",
          }));
          if (mapped.length > 0) {
            setTestimonials(mapped);
          }
        }
      } catch (err) {
        console.error("Error fetching testimonials", err);
      }
    };
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api, testimonials]); // Update when testimonials change

  // Auto-play
  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [api]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Por favor dinos cómo te llamas.",
        variant: "destructive",
      });
      return;
    }

    if (message.trim().length < 10) {
      toast({
        title: "Testimonio muy corto",
        description: "Cuéntanos un poco más sobre tu experiencia (mínimo 10 caracteres).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/content/testimonials", { // Using Admin Endpoint temporarily as public submission
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          comment: message,
          rating: 5,
          city: "Web User"
        })
      });

      if (response.ok) {
        toast({
          title: "¡Gracias por tu opinión!",
          description: "Tu testimonio ha sido enviado para moderación.",
        });
        setIsOpen(false);
        setName("");
        setMessage("");
      } else {
        throw new Error("Error submitting");
      }

    } catch (e) {
      toast({
        title: "Error",
        description: "No pudimos enviar tu testimonio. Intenta más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section-padding bg-primary text-primary-foreground overflow-hidden">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-left"
          >
            <span className="text-gold font-body text-sm tracking-wider uppercase">
              Testimonios Reales
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-3">
              Lo que dicen nuestros huéspedes
            </h2>
            <p className="font-body text-primary-foreground/70 mt-4 max-w-xl">
              Experiencias verificadas de viajeros que han disfrutado de Villa Roli
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-primary gap-2">
                  <MessageSquarePlus size={18} />
                  Déjanos tu testimonio
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Comparte tu experiencia</DialogTitle>
                  <DialogDescription>
                    ¿Cómo fue tu estadía en Villa Roli? Tu opinión es muy valiosa para nosotros.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tu Nombre</Label>
                    <Input
                      id="name"
                      placeholder="Ej: Juan Pérez"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Tu Testimonio</Label>
                    <Textarea
                      id="message"
                      placeholder="Cuéntanos qué fue lo que más te gustó..."
                      className="min-h-[100px]"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground text-right">{message.length}/10 min</p>
                  </div>

                  <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md text-xs border border-yellow-200">
                    <strong>Nota:</strong> Este testimonio se mostrará temporalmente en el sitio web como vista previa.
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isSubmitting} className="bg-gold text-primary hover:bg-gold/90">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Publicando...
                        </>
                      ) : (
                        "Publicar Testimonio"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 h-full border border-primary-foreground/20 flex flex-col">
                    <Quote className="w-8 h-8 text-gold mb-4 flex-shrink-0" />

                    <p className="font-body text-primary-foreground/90 leading-relaxed mb-6 italic flex-grow">
                      "{testimonial.text}"
                    </p>

                    <div className="mt-auto">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} size={16} className="fill-gold text-gold" />
                        ))}
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-display font-semibold text-primary-foreground">
                            {testimonial.name}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-primary-foreground/60">
                            <span>{testimonial.location}</span>
                            <span>•</span>
                            <span>{testimonial.date}</span>
                          </div>
                          <p className="font-body text-xs text-primary-foreground/50 mt-1">
                            {testimonial.type}
                          </p>
                        </div>
                        <span className="font-body text-xs bg-gold/20 text-gold px-2 py-1 rounded-full flex-shrink-0">
                          {testimonial.source}
                        </span>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation buttons */}
            <div className="hidden md:flex justify-center gap-4 mt-8">
              <CarouselPrevious className="relative inset-0 translate-x-0 translate-y-0 bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/30 hover:text-primary-foreground" />
              <CarouselNext className="relative inset-0 translate-x-0 translate-y-0 bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/30 hover:text-primary-foreground" />
            </div>
          </Carousel>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === current
                  ? "bg-gold w-6"
                  : "bg-primary-foreground/30 hover:bg-primary-foreground/50"
                  }`}
                aria-label={`Ir a reseña ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
