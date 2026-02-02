import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { FileText, AlertTriangle, Clock, Users, PawPrint, Phone, Mail, Shield, DollarSign, Droplets } from "lucide-react";

const Terminos = () => {
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
            <div className="flex justify-center mb-6">
              <FileText className="w-16 h-16 text-primary" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Términos y Condiciones
            </h1>
            <p className="font-body text-muted-foreground text-lg mt-6">
              Finca de Recreación y Turismo - REF: Términos y Condiciones 2026
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
            className="max-w-4xl mx-auto"
          >
            {/* Introducción */}
            <div className="bg-secondary/50 rounded-2xl p-6 md:p-8 mb-10">
              <p className="font-body text-foreground text-lg leading-relaxed">
                Los siguientes términos y condiciones son los que regirán en el contrato de alquiler en la propiedad.
              </p>
            </div>

            {/* Lista de términos */}
            <div className="space-y-6">
              {/* Término 1 - COVID */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    1
                  </span>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    El arrendatario y sus acompañantes saben del riesgo que permanece sobre un posible contagio del virus COVID-19 o sus variantes, dicho contagio (de él o de algunos de sus acompañantes) no es un motivo para la cancelación del contrato de su parte. Entendiendo así que las personas no contagiadas podrán asistir a la finca sin ningún tipo de problema. El arrendatario se abstiene de realizar cualquier tipo de procedimiento legal o reclamaciones.
                  </p>
                </div>
              </div>

              {/* Término 2 - Pagos */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    2
                  </span>
                  <div>
                    <p className="font-body text-muted-foreground leading-relaxed">
                      Para asegurar la reserva el arrendatario se compromete a cancelar el valor del respectivo alquiler de la siguiente manera:
                    </p>
                    <ul className="mt-3 space-y-2 font-body text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-cta rounded-full"></span>
                        <strong>20%</strong> al momento de separar la fecha
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-cta rounded-full"></span>
                        <strong>Saldo restante:</strong> tres (3) días antes o mínimo 24 horas antes de su llegada
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Término 3 - Depósito de Garantía */}
              <div className="bg-highlight/20 rounded-xl p-6 border-2 border-highlight">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-highlight rounded-full flex items-center justify-center text-foreground font-bold">
                    3
                  </span>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-cta mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-body text-foreground leading-relaxed">
                        Se requiere un <strong>depósito de garantía</strong> por un monto de <strong className="text-cta">$100.000 (Cien mil pesos colombianos)</strong>, este depósito se retendrá como garantía por posibles gastos adicionales o daños, y se reembolsará íntegramente al finalizar tu estancia.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Término 4 - Cancelación */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    4
                  </span>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    En caso de cancelación del arriendo por parte del arrendatario, éste exonera a VILLA ROLI de cualquier tipo de responsabilidad. <strong>VILLA ROLI no está obligada a devolver el valor parcial o total del valor del arriendo que hubiese recibido.</strong>
                  </p>
                </div>
              </div>

              {/* Término 5 - Fuerza Mayor */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    5
                  </span>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    VILLA ROLI en caso de cancelación por motivos de fuerza mayor o hechos de la naturaleza impredecibles que impidan el acceso del arrendatario a la finca en la fecha estipulada, VILLA ROLI no está obligada devolver el valor parcial o total del valor del arriendo que hubiese recibido, pero sí se le garantizará al arrendatario la <strong>reprogramación en una nueva fecha sujeta a disponibilidad</strong>.
                  </p>
                </div>
              </div>

              {/* Término 6 - Venta */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    6
                  </span>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    En caso de que se presente una venta del predio, nos comprometemos a mantener su reserva sin afectación alguna.
                  </p>
                </div>
              </div>

              {/* Término 7 - Conducta */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    7
                  </span>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    El arrendatario junto con las demás personas que llegarán a la propiedad se compromete a asumir una conducta apropiada según la ley colombiana. Éstos serán responsables de cualquier acto ejercido fuera de la ley y exoneran a VILLA ROLI de todo tipo de responsabilidad civil o penal.
                  </p>
                </div>
              </div>

              {/* Término 8 - Pérdidas */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    8
                  </span>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    <strong>VILLA ROLI no se hace responsable por pérdidas o robos de sus pertenencias en la finca.</strong> Deberán estar pendientes de las mismas.
                  </p>
                </div>
              </div>

              {/* Término 9 - Daños */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    9
                  </span>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    El arrendatario se verá obligado a devolver el inmueble en las mismas condiciones en las que se le fue entregada la propiedad. Éste es responsable de los daños materiales o multas que se ocasionen al respectivo inmueble; el arrendatario debe cancelar este valor antes de salir del inmueble.
                  </p>
                </div>
              </div>

              {/* Término 10 - Aseo */}
              <div className="bg-highlight/20 rounded-xl p-6 border-2 border-highlight">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-highlight rounded-full flex items-center justify-center text-foreground font-bold">
                    10
                  </span>
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-cta mt-1 flex-shrink-0" />
                    <p className="font-body text-foreground leading-relaxed">
                      El recargo para el aseo correspondiente es de <strong className="text-cta">$70.000 (Setenta mil pesos colombianos)</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Término 11 - Check-in/Check-out */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    11
                  </span>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <p className="font-body text-muted-foreground leading-relaxed">
                      El arrendatario se compromete a cumplir el horario del Check-in / Check-out, en compañía del número de personas indicadas en la respectiva carta de autorización expedida por el administrador de VILLA ROLI.
                    </p>
                  </div>
                </div>
              </div>

              {/* Término 12 - Exceso de personas */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    12
                  </span>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <p className="font-body text-muted-foreground leading-relaxed">
                      En caso de exceder dicho número, le otorga el derecho a la persona encargada de la propiedad, generar el recargo monetario correspondiente, realizar el descuento correspondiente del depósito o según el caso prohibir la entrada a las personas que exceden dicha carta y esto no constituye incumplimiento del contrato por parte de VILLA ROLI.
                    </p>
                  </div>
                </div>
              </div>

              {/* Término 13 - Ley 679 */}
              <div className="bg-destructive/10 rounded-xl p-6 border border-destructive/30">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-destructive/20 rounded-full flex items-center justify-center text-destructive font-bold">
                    13
                  </span>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
                    <p className="font-body text-muted-foreground leading-relaxed">
                      En desarrollo de lo dispuesto en el artículo 17 de la <strong>Ley 679 de 2001</strong>, VILLA ROLI advierte al turista que la explotación y el abuso sexual de menores de edad en el país son sancionados penal y administrativamente, conforme a las leyes vigentes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Término 14 - Vías de acceso */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    14
                  </span>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    Por favor antes de programar su viaje, <strong>verifique restricciones de las vías de acceso a la finca</strong>.
                  </p>
                </div>
              </div>

              {/* Término 15 - Pólvora */}
              <div className="bg-destructive/10 rounded-xl p-6 border border-destructive/30">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-destructive/20 rounded-full flex items-center justify-center text-destructive font-bold">
                    15
                  </span>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    <strong>Está prohibido la quema de cualquier tipo de pólvora y el uso de globos de mecha encendida.</strong> En algunos municipios o veredas se aplican multas y/o sanciones por estos actos.
                  </p>
                </div>
              </div>

              {/* Término 16 - Zonas húmedas */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    16
                  </span>
                  <div className="flex items-start gap-3">
                    <Droplets className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <p className="font-body text-muted-foreground leading-relaxed">
                      En las zonas húmedas (piscinas), se solicita el uso del gorro de baño y mantener medidas de seguridad necesarias para un buen uso de estos espacios.
                    </p>
                  </div>
                </div>
              </div>

              {/* Término 17 - Reglas piscinas */}
              <div className="bg-primary/10 rounded-xl p-6 border border-primary/30">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                    17
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground mb-3">REGLAS EN ZONAS HÚMEDAS:</h3>
                    <ul className="space-y-2 font-body text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-cta rounded-full"></span>
                        No correr alrededor de las piscinas
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-cta rounded-full"></span>
                        No consumir alimentos dentro de las piscinas
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-cta rounded-full"></span>
                        Prohibido el uso de envases de vidrio en las piscinas
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-cta rounded-full"></span>
                        Mantener vigilancia extrema a los menores de edad
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Término 18 - Mascotas */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    18
                  </span>
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <PawPrint className="w-5 h-5 text-primary" />
                      <h3 className="font-display text-lg font-bold text-foreground">Mascotas</h3>
                    </div>
                    <p className="font-body text-muted-foreground leading-relaxed mb-3">
                      La entrada de mascotas a la propiedad es permitida y se debe tener en cuenta:
                    </p>
                    <ul className="space-y-2 font-body text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-cta rounded-full mt-2 flex-shrink-0"></span>
                        Recoger sus desechos biológicos
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-cta rounded-full mt-2 flex-shrink-0"></span>
                        Perros de raza peligrosa deben tener bozal
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-cta rounded-full mt-2 flex-shrink-0"></span>
                        No se permite el ingreso de los ejemplares a las piscinas
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-cta rounded-full mt-2 flex-shrink-0"></span>
                        No pueden hacer uso de mobiliario (camas, sofás)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-cta rounded-full mt-2 flex-shrink-0"></span>
                        Tener precaución con las mascotas ya que pueden salir del predio sin percatarse
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Firma */}
            <div className="mt-12 bg-secondary rounded-2xl p-8 text-center">
              <p className="font-body text-muted-foreground mb-4">Cordialmente,</p>
              <p className="font-display text-xl font-bold text-foreground">Alberto Jiménez B.</p>
              <p className="font-body text-muted-foreground mb-6">Administrador</p>
              
              <div className="flex flex-col md:flex-row justify-center items-center gap-6">
                <a
                  href="mailto:reservavillaroli.toca@gmail.com"
                  className="flex items-center gap-2 text-cta hover:underline"
                >
                  <Mail className="w-5 h-5" />
                  reservavillaroli.toca@gmail.com
                </a>
                <a
                  href="https://wa.me/573229726625"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-cta hover:underline"
                >
                  <Phone className="w-5 h-5" />
                  WhatsApp: (+57 322 972 6625)
                </a>
              </div>
              
              <div className="mt-6 flex justify-center gap-4 text-sm text-muted-foreground">
                <span>Facebook: villaroli Tocaima Cundinamarca</span>
                <span>•</span>
                <span>Instagram: villaroli.Tocaima</span>
              </div>
              
              <p className="mt-4 text-sm text-muted-foreground">
                Colombia • Cundinamarca • Tocaima
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Terminos;
