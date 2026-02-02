import cabana1Sala from "@/assets/cabana-1-sala.jpg";
import cabana1Exterior from "@/assets/cabana-1-exterior.jpg";
import cabana1Habitacion1 from "@/assets/cabana-1-habitacion1.jpg";
import cabana1Habitacion2 from "@/assets/cabana-1-habitacion2.jpg";
import cabana1Habitacion3 from "@/assets/cabana-1-habitacion3.jpg";
import cabana1Bano1 from "@/assets/cabana-1-bano1.jpg";
import cabana1Bano2 from "@/assets/cabana-1-bano2.jpg";
import cabana1Video from "@/assets/cabana-1-video.mp4";

import cabana2Habitacion1 from "@/assets/cabana-2-habitacion1.jpg";
import cabana2Habitacion2 from "@/assets/cabana-2-habitacion2.jpg";
import cabana2Habitacion3 from "@/assets/cabana-2-habitacion3.jpg";
import cabana2Exterior from "@/assets/cabana-2-exterior.jpg";
import cabana2Bano1 from "@/assets/cabana-2-bano1.jpg";
import cabana2Bano2 from "@/assets/cabana-2-bano2.jpg";
import cabana2Video from "@/assets/cabana-2-video.mp4";

import cabana3Habitacion1 from "@/assets/cabana-3-habitacion1.jpg";
import cabana3Habitacion2 from "@/assets/cabana-3-habitacion2.jpg";
import cabana3Bano from "@/assets/cabana-3-bano.jpg";
import cabana3Video from "@/assets/cabana-3-video.mp4";

export interface CabinImage {
  src: string;
  alt: string;
}

export interface Cabin {
  name: string;
  description: string;
  guests: number;
  beds: string;
  baths: number;
  features: string[];
  images: CabinImage[];
  video: string;
}

export const CABINS: Cabin[] = [
  {
    name: "Cabaña 1 - Familiar",
    description: "La cabaña más completa de Villa Roli. Cuenta con una acogedora sala de estar con TV, cocina integral totalmente equipada con nevera, y cómodos ventiladores en todas las habitaciones. Incluye sofá cama para huéspedes adicionales. Perfecta para familias grandes que buscan comodidad y privacidad.",
    guests: 12,
    beds: "4 habitaciones con camas dobles",
    baths: 2,
    features: [
      "Sala de estar con TV",
      "Cocina integral",
      "Nevera",
      "2 Baños completos",
      "Ventiladores",
      "Sofá cama",
      "WiFi disponible"
    ],
    images: [
      { src: cabana1Sala, alt: "Sala de estar Cabaña 1" },
      { src: cabana1Exterior, alt: "Exterior Cabaña 1" },
      { src: cabana1Habitacion1, alt: "Habitación principal Cabaña 1" },
      { src: cabana1Habitacion2, alt: "Segunda habitación Cabaña 1" },
      { src: cabana1Habitacion3, alt: "Tercera habitación Cabaña 1" },
      { src: cabana1Bano1, alt: "Baño principal Cabaña 1" },
      { src: cabana1Bano2, alt: "Segundo baño Cabaña 1" },
    ],
    video: cabana1Video,
  },
  {
    name: "Cabaña 2 - Grupal",
    description: "Ideal para grupos grandes de amigos o familias extensas. Con amplio espacio que incluye 8 camas dobles y 4 camas sencillas. Cuenta con una espaciosa terraza con columpio para relajarse y disfrutar de las vistas. Ventiladores en todas las áreas para mayor confort.",
    guests: 20,
    beds: "8 camas dobles + 4 camas sencillas",
    baths: 2,
    features: [
      "8 Camas dobles",
      "4 Camas sencillas",
      "Terraza amplia",
      "Columpio",
      "Ventiladores",
      "2 Baños",
      "WiFi disponible"
    ],
    images: [
      { src: cabana2Habitacion1, alt: "Habitación principal Cabaña 2" },
      { src: cabana2Habitacion2, alt: "Segunda habitación Cabaña 2" },
      { src: cabana2Habitacion3, alt: "Tercera habitación Cabaña 2" },
      { src: cabana2Exterior, alt: "Exterior y terraza Cabaña 2" },
      { src: cabana2Bano1, alt: "Baño principal Cabaña 2" },
      { src: cabana2Bano2, alt: "Segundo baño Cabaña 2" },
    ],
    video: cabana2Video,
  },
  {
    name: "Cabaña 3 - Íntima",
    description: "La opción perfecta para grupos pequeños o familias. Ofrece un ambiente acogedor con una cama doble y un camarote. Baño privado y ventiladores para su comodidad. Esta cabaña es la elegida para el Plan Familia.",
    guests: 5,
    beds: "1 cama doble + 1 camarote",
    baths: 1,
    features: [
      "1 Cama doble",
      "1 Camarote",
      "Baño privado",
      "Ventiladores",
      "Ambiente íntimo",
      "Ideal para Plan Familia"
    ],
    images: [
      { src: cabana3Habitacion1, alt: "Habitación principal Cabaña 3" },
      { src: cabana3Habitacion2, alt: "Segunda habitación Cabaña 3" },
      { src: cabana3Bano, alt: "Baño Cabaña 3" },
    ],
    video: cabana3Video,
  },
];
