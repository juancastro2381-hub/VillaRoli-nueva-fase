import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";
import { VillaRoliLogo } from "@/components/ui/VillaRoliLogo";
export function Footer() {
  return <footer className="bg-primary/90 text-primary-foreground backdrop-blur-sm">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <VillaRoliLogo variant="light" />
            <p className="font-body text-primary-foreground/80 leading-relaxed mt-4">
              Un refugio exclusivo en el corazón de la naturaleza colombiana. Descansa,
              reconecta y vive momentos inolvidables.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="https://www.instagram.com/villaroli.tocaima" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-primary-foreground/10 hover:bg-gold/20 hover:text-gold transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://www.facebook.com/villaroliTocaimaCundinamarca" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-primary-foreground/10 hover:bg-gold/20 hover:text-gold transition-colors">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold">Enlaces Rápidos</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="font-body text-primary-foreground/80 hover:text-gold transition-colors">
                Inicio
              </Link>
              <Link to="/alojamiento" className="font-body text-primary-foreground/80 hover:text-gold transition-colors">
                Alojamiento
              </Link>
              <Link to="/reservas" className="font-body text-primary-foreground/80 hover:text-gold transition-colors">
                Reservas
              </Link>
              <Link to="/blog" className="font-body text-primary-foreground/80 hover:text-gold transition-colors">
                Blog
              </Link>
              <Link to="/contacto" className="font-body text-primary-foreground/80 hover:text-gold transition-colors">
                Contacto
              </Link>
            </nav>
          </div>

          {/* Servicios */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold">Servicios</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/alojamiento" className="font-body text-primary-foreground/80 hover:text-gold transition-colors">
                Finca Completa
              </Link>
              <Link to="/alojamiento/pasadias" className="font-body text-primary-foreground/80 hover:text-gold transition-colors">
                Pasadías
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-gold shrink-0 mt-1" />
                <a 
                  href="https://www.google.com/maps?q=4.430722,-74.683056" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-body text-primary-foreground/80 hover:text-gold transition-colors"
                >
                  A 5 Km Vía Tocaima - Girardot, Cundinamarca
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-gold shrink-0" />
                <a href="https://wa.me/573229726625" target="_blank" rel="noopener noreferrer" className="font-body text-primary-foreground/80 hover:text-gold transition-colors">
                  +57 322 972 6625
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-gold shrink-0" />
                <a href="mailto:reservavillaroli.toca@gmail.com" className="font-body text-primary-foreground/80 hover:text-gold transition-colors">
                  reservavillaroli.toca@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-body text-sm text-primary-foreground">
              © {new Date().getFullYear()} Villa Roli. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <Link to="/privacidad" className="font-body text-sm transition-colors text-primary-foreground">
                Política de Privacidad
              </Link>
              <Link to="/terminos" className="font-body text-sm transition-colors text-primary-foreground">
                Términos y Condiciones
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>;
}