import { motion } from "framer-motion";
import { Wifi, Flame, Mountain, Sparkles, ShieldCheck, Trees } from "lucide-react";

const features = [
  {
    icon: Mountain,
    title: "Naturaleza",
    description: "Despierta con el color verde y el aire puro de la naturaleza.",
  },
  {
    icon: Flame,
    title: "Área de fogata",
    description: "Noches acogedoras junto a fuego entre la paz y la tranquilidad de VillaRoli.",
  },
  {
    icon: Sparkles,
    title: "Piscinas privadas para adultos y niños.",
    description: "Disfruta y relájate en nuestras piscinas privadas.",
  },
  {
    icon: Wifi,
    title: "Wi-Fi de Alta Velocidad",
    description: "Mantente conectado sin sacrificar la tranquilidad.",
  },
  {
    icon: Trees,
    title: "Senderos Naturales",
    description: "Muy cerca de sitios turísticos en la zona.",
  },
  {
    icon: ShieldCheck,
    title: "Privacidad Total",
    description: "Cabañas aisladas para tu máxima intimidad y descanso.",
  },
];

export function FeaturesSection() {
  return (
    <section className="section-padding bg-secondary">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-cta font-body text-sm tracking-wider uppercase">
            ¿Por qué elegirnos?
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-3">
            Una experiencia sin igual
          </h2>
          <p className="font-body text-muted-foreground mt-4 max-w-2xl mx-auto">
            Cada detalle ha sido cuidadosamente pensado para brindarte el máximo
            confort y una conexión profunda con la naturaleza.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-card p-8 rounded-2xl border border-border hover:border-cta/50 transition-all duration-300 hover:shadow-xl h-full">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-cta/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary group-hover:text-cta transition-colors" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="font-body text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
