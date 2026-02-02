import { motion } from "framer-motion";
import { Star, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";

// Interface matching future Google Places API structure
export interface GoogleReview {
    author_name: string;
    rating: number; // 1-5
    text: string;
    relative_time_description: string; // e.g., "a week ago"
    profile_photo_url: string;
}

const googleReviews: GoogleReview[] = [
    {
        author_name: "Santiago Rios",
        rating: 5,
        text: "Un lugar espectacular para desconectarse. Las instalaciones son impecables y la atención de Don Alberto es de otro nivel. Definitivamente volveremos.",
        relative_time_description: "hace 2 semanas",
        profile_photo_url: "https://ui-avatars.com/api/?name=Santiago+Rios&background=random",
    },
    {
        author_name: "Marcela Gomez",
        rating: 5,
        text: "Celebramos el cumpleaños de mi mamá y fue perfecto. La piscina limpia, las zonas verdes hermosas y las cabañas muy cómodas. ¡Súper recomendado!",
        relative_time_description: "hace 1 mes",
        profile_photo_url: "https://ui-avatars.com/api/?name=Marcela+Gomez&background=random",
    },
    {
        author_name: "Juan David Perez",
        rating: 5,
        text: "Excelente sitio para pasar el día. El pasadía es muy completo y económico. Nos encantó la zona de BBQ.",
        relative_time_description: "hace 2 meses",
        profile_photo_url: "https://ui-avatars.com/api/?name=Juan+David+Perez&background=random",
    },
    {
        author_name: "Andrea Lopez",
        rating: 4,
        text: "Muy bonito todo, la tranquilidad es impagable. Solo sugiero mejorar un poco la señalización para llegar, pero el resto 10/10.",
        relative_time_description: "hace 3 meses",
        profile_photo_url: "https://ui-avatars.com/api/?name=Andrea+Lopez&background=random",
    },
    {
        author_name: "Carlos Rodriguez",
        rating: 5,
        text: "Hemos ido dos veces y siempre es una gran experiencia. Las mascotas son bienvenidas y eso para nosotros es fundamental.",
        relative_time_description: "hace 4 meses",
        profile_photo_url: "https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=random",
    },
];

export function GoogleReviewsSection() {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!api) return;

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap());

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    // Auto-play
    useEffect(() => {
        if (!api) return;
        const interval = setInterval(() => {
            api.scrollNext();
        }, 6000);
        return () => clearInterval(interval);
    }, [api]);

    return (
        <section className="section-padding bg-background overflow-hidden relative">
            <div className="container-custom relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <MapPin className="text-red-500 w-5 h-5" />
                        <span className="text-muted-foreground font-body text-sm tracking-wider uppercase">
                            Google Maps
                        </span>
                    </div>
                    <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-2">
                        Opiniones en Google
                    </h2>
                    <div className="flex items-center justify-center gap-2 mt-4 text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={24} className="fill-current" />
                        ))}
                        <span className="text-foreground font-bold text-xl ml-2">4.9/5.0</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Carousel
                        setApi={setApi}
                        opts={{ align: "start", loop: true }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-4">
                            {googleReviews.map((review, index) => (
                                <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                    <div className="bg-card rounded-xl p-6 h-full border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col">
                                        <div className="flex items-center gap-3 mb-4">
                                            <img
                                                src={review.profile_photo_url}
                                                alt={review.author_name}
                                                className="w-10 h-10 rounded-full"
                                            />
                                            <div>
                                                <h4 className="font-semibold text-sm text-foreground">{review.author_name}</h4>
                                                <div className="flex text-yellow-500 text-xs">
                                                    {[...Array(review.rating)].map((_, i) => (
                                                        <Star key={i} size={12} className="fill-current" />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="ml-auto">
                                                <img
                                                    src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                                                    alt="Google"
                                                    className="w-5 h-5 opacity-70"
                                                />
                                            </div>
                                        </div>

                                        <p className="font-body text-muted-foreground text-sm leading-relaxed mb-4 flex-grow line-clamp-4">
                                            "{review.text}"
                                        </p>

                                        <p className="text-xs text-muted-foreground/60 font-medium pt-4 border-t border-border/50">
                                            {review.relative_time_description}
                                        </p>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <div className="hidden md:flex justify-center gap-4 mt-8">
                            <CarouselPrevious className="relative inset-0 translate-x-0 translate-y-0" />
                            <CarouselNext className="relative inset-0 translate-x-0 translate-y-0" />
                        </div>
                    </Carousel>
                </motion.div>
            </div>
        </section>
    );
}
