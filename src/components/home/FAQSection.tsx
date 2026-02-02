import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "¿Cuál es el horario de check-in y check-out?",
    answer: "El check-in es a partir de las 3:00 PM y el check-out debe realizarse antes de las 12:00 PM (mediodía). Si necesitas un horario diferente, contáctanos con anticipación y haremos lo posible por acomodarte según disponibilidad."
  },
  {
    question: "¿Se permiten mascotas en las cabañas?",
    answer: "Sí, aceptamos mascotas pequeñas y medianas en algunas de nuestras cabañas con un cargo adicional de $30.000 COP por noche. Por favor, infórmanos al momento de la reserva para confirmar disponibilidad. Las mascotas deben estar bajo supervisión en todo momento."
  },
  {
    question: "¿Cuál es la política de cancelación?",
    answer: "Cancelaciones con más de 7 días de anticipación: reembolso del 100%. Entre 3 y 7 días: reembolso del 50%. Menos de 3 días: no hay reembolso. En caso de emergencias o situaciones especiales, evaluamos cada caso individualmente."
  },
  {
    question: "¿Qué incluye el alojamiento?",
    answer: "Todas nuestras cabañas incluyen: ropa de cama, toallas, cocina equipada, WiFi, parqueadero, acceso a zonas comunes, piscinas y zona BBQ. Consulta los detalles específicos de cada cabaña."
  },
  {
    question: "¿Cómo puedo realizar mi reserva?",
    answer: "Puedes reservar directamente a través de nuestra página web en la sección de Reservas, o contactarnos por WhatsApp para una atención personalizada. Requerimos un anticipo del 50% para confirmar tu reserva."
  },
  {
    question: "¿Hay un número mínimo de noches para reservar?",
    answer: "El mínimo de noches varía según la temporada. En temporada alta (festivos, puentes y vacaciones) el mínimo es de 2 noches. En temporada regular aceptamos reservas desde 1 noche."
  }
];

const FAQSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-cta font-medium tracking-wider uppercase text-sm">
            Resolvemos tus dudas
          </span>
          <h2 className="font-display text-3xl md:text-4xl text-foreground mt-2 mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Encuentra respuestas a las preguntas más comunes sobre tu estadía en Villa Roli
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-border/50 bg-card/50 px-6 mb-3 rounded-lg"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:text-cta hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
