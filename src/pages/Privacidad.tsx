import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";

const Privacidad = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-secondary">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Política de Privacidad
            </h1>
            <p className="font-body text-muted-foreground text-lg mt-6">
              Última actualización: Enero 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto prose prose-lg prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-p:font-body prose-li:text-muted-foreground"
          >
            <h2>1. Información que Recopilamos</h2>
            <p>
              En Villa Roli, recopilamos información personal que usted nos proporciona
              directamente cuando realiza una reserva, se suscribe a nuestro boletín,
              o se comunica con nosotros. Esta información puede incluir:
            </p>
            <ul>
              <li>Nombre completo</li>
              <li>Dirección de correo electrónico</li>
              <li>Número de teléfono</li>
              <li>Dirección de facturación</li>
              <li>Información de pago</li>
              <li>Preferencias de hospedaje</li>
            </ul>

            <h2>2. Uso de la Información</h2>
            <p>Utilizamos la información recopilada para:</p>
            <ul>
              <li>Procesar y gestionar sus reservas</li>
              <li>Comunicarnos con usted sobre su estadía</li>
              <li>Enviar información promocional (con su consentimiento)</li>
              <li>Mejorar nuestros servicios</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>

            <h2>3. Protección de Datos</h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas apropiadas
              para proteger su información personal contra acceso no autorizado,
              alteración, divulgación o destrucción.
            </p>

            <h2>4. Compartir Información</h2>
            <p>
              No vendemos, comercializamos ni transferimos su información personal a
              terceros sin su consentimiento, excepto cuando sea necesario para
              proporcionar nuestros servicios o cumplir con requisitos legales.
            </p>

            <h2>5. Cookies</h2>
            <p>
              Nuestro sitio web utiliza cookies para mejorar su experiencia de navegación.
              Puede configurar su navegador para rechazar cookies, aunque esto puede
              afectar la funcionalidad del sitio.
            </p>

            <h2>6. Sus Derechos</h2>
            <p>Usted tiene derecho a:</p>
            <ul>
              <li>Acceder a su información personal</li>
              <li>Rectificar datos inexactos</li>
              <li>Solicitar la eliminación de sus datos</li>
              <li>Oponerse al procesamiento de sus datos</li>
              <li>Retirar su consentimiento en cualquier momento</li>
            </ul>

            <h2>7. Contacto</h2>
            <p>
              Si tiene preguntas sobre esta política de privacidad o desea ejercer
              sus derechos, puede contactarnos en:
            </p>
            <p>
              <strong>Email:</strong> reservavillaroli.toca@gmail.com<br />
              <strong>Teléfono:</strong> +57 322 972 6625
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Privacidad;
