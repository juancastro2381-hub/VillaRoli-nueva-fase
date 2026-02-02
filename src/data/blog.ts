export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    content: string; // Full body content
    image: string;
    author: string;
    date: string;
    category: "Aventura" | "Bienestar" | "Gastronomía" | "Naturaleza" | "Romance" | "Sostenibilidad";
}

export const BLOG_POSTS: BlogPost[] = [
    {
        slug: "mejores-rutas-senderismo-colombia",
        title: "Las Mejores Rutas de Senderismo Cerca de Villa Roli",
        excerpt:
            "Descubre los senderos más impresionantes que puedes recorrer durante tu estadía. Desde caminatas suaves hasta rutas de alta montaña.",
        content: `
      <p>Cundinamarca es una región privilegiada para el senderismo, y los alrededores de Tocaima no son la excepción. Con su clima cálido y paisajes montañosos, ofrece rutas para todos los niveles.</p>
      
      <h3>1. El Camino Real</h3>
      <p>Una ruta histórica que conecta varios municipios de la región. Pasando por antiguos puentes de piedra y vegetación nativa, es perfecta para quienes disfrutan de la historia y la naturaleza combinadas.</p>
      
      <h3>2. Cascada del Amor</h3>
      <p>A solo 20 minutos en vehículo desde Villa Roli, esta caminata de dificultad media te lleva a una hermosa caída de agua donde puedes refrescarte. Recomendamos ir temprano en la mañana.</p>
      
      <h3>3. Mirador del Alto</h3>
      <p>Para los más aventureros, esta subida exigente ofrece la mejor vista panorámica del valle del río Bogotá. No olvides llevar suficiente hidratación.</p>
      
      <p>En Villa Roli podemos orientarte sobre guías locales que te acompañarán para una experiencia segura y enriquecedora.</p>
    `,
        image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800",
        author: "Equipo Villa Roli",
        date: "15 Dic 2025",
        category: "Aventura",
    },
    {
        slug: "desconexion-digital-naturaleza",
        title: "El Arte de la Desconexión Digital en la Naturaleza",
        excerpt:
            "Cómo aprovechar tu estadía para hacer un verdadero detox digital y reconectar con lo que realmente importa.",
        content: `
      <p>En un mundo hiperconectado, el verdadero lujo es poder desconectarse. Villa Roli está diseñada para ser ese refugio donde el sonido de las notificaciones se reemplaza por el canto de las aves.</p>
      
      <h3>Beneficios del Detox Digital</h3>
      <ul>
        <li>Reducción del estrés y la ansiedad.</li>
        <li>Mejora en la calidad del sueño.</li>
        <li>Mayor conexión con tus acompañantes.</li>
        <li>Aumento de la creatividad.</li>
      </ul>
      
      <h3>Consejos para tu estadía</h3>
      <p>Te invitamos a dejar el celular en la habitación y disfrutar de nuestras zonas verdes, la piscina y la compañía de los tuyos sin interrupciones. Descubrirás que la vida real tiene mejor resolución que cualquier pantalla.</p>
    `,
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        author: "María González",
        date: "10 Dic 2025",
        category: "Bienestar",
    },
    {
        slug: "gastronomia-region-cafetera",
        title: "Sabores de la Región: Gastronomía Local",
        excerpt:
            "Un recorrido por los sabores auténticos de nuestra región. Desde el café de origen hasta los platos tradicionales.",
        content: `
      <p>La gastronomía de Cundinamarca y Tolima (estamos muy cerca del límite) es rica y variada. En tu visita a Tocaima, hay platos que no puedes dejar de probar.</p>
      
      <h3>La Lechona</h3>
      <p>Aunque típica del Tolima, en la región se prepara una de las mejores del país. Arroz, arvejas y carne de cerdo cocinada en horno de leña.</p>
      
      <h3>Sancocho de Gallina</h3>
      <p>El plato clásico de paseo en olla o en restaurante campestre. Hecho con leña, plátano, yuca y gallina criolla.</p>
      
      <p>Pregunta en la recepción por nuestras recomendaciones de restaurantes locales de confianza.</p>
    `,
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
        author: "Carlos Martínez",
        date: "5 Dic 2025",
        category: "Gastronomía",
    },
    {
        slug: "observacion-aves-colombia",
        title: "Avistamiento de Aves: Colombia, Paraíso de Biodiversidad",
        excerpt:
            "Colombia es el país con más especies de aves del mundo. Te contamos qué especies puedes encontrar en Villa Roli.",
        content: `
      <p>No necesitas ser un experto ornitólogo para disfrutar de la diversidad de aves en Villa Roli. Solo con sentarte en la terraza en las horas de la mañana, podrás observar un espectáculo de colores.</p>
      
      <h3>Especies Comunes</h3>
      <ul>
        <li><strong>Azulejos:</strong> Inconfundibles por su color vibrante.</li>
        <li><strong>Canarios:</strong> Con su canto melodioso.</li>
        <li><strong>Colibríes:</strong> Visitantes frecuentes de nuestras flores.</li>
        <li><strong>Gavilanes:</strong> Planeando alto en el cielo.</li>
      </ul>
      
      <p>Trae tus binoculares. ¡Te sorprenderá la cantidad de vida que nos rodea!</p>
    `,
        image: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800",
        author: "Equipo Villa Roli",
        date: "28 Nov 2025",
        category: "Naturaleza",
    },
    {
        slug: "escapadas-romanticas-parejas",
        title: "Guía Completa: Escapadas Románticas en Cabaña",
        excerpt:
            "Ideas y consejos para planear la escapada romántica perfecta. Desde actividades hasta sorpresas especiales.",
        content: `
      <p>A veces solo se necesitan un par de días para reavivar la llama. Una escapada a una finca privada ofrece la intimidad y tranquilidad que muchas parejas buscan.</p>
      
      <h3>Ideas para sorprender</h3>
      <p>Una cena bajo las estrellas, un baño nocturno en la piscina o simplemente una tarde de lectura en la hamaca. Lo importante es el tiempo de calidad juntos.</p>
      
      <p>Contáctanos si deseas que preparemos algo especial para tu llegada.</p>
    `,
        image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800",
        author: "Ana Rodríguez",
        date: "20 Nov 2025",
        category: "Romance",
    },
    {
        slug: "sostenibilidad-turismo-responsable",
        title: "Turismo Sostenible: Nuestro Compromiso con el Planeta",
        excerpt:
            "Conoce las prácticas sostenibles que implementamos en Villa Roli para minimizar nuestro impacto ambiental.",
        content: `
      <p>Creemos que el turismo debe cuidar el entorno que lo hace posible. En Villa Roli estamos comprometidos con prácticas que respeten la naturaleza.</p>
      
      <h3>Nuestras Acciones</h3>
      <ul>
        <li>Gestión responsable del agua.</li>
        <li>Iluminación LED para reducir consumo energético.</li>
        <li>Separación de residuos y compostaje.</li>
        <li>Mantenimiento de zonas verdes con productos amigables.</li>
      </ul>
      
      <p>Tú también puedes ayudar. Apaga las luces y el aire acondicionado cuando no los necesites y cuida el agua. Pequeñas acciones hacen grandes cambios.</p>
    `,
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
        author: "Equipo Villa Roli",
        date: "15 Nov 2025",
        category: "Sostenibilidad",
    },
];

export const CATEGORY_COLORS: Record<string, string> = {
    Aventura: "bg-primary text-primary-foreground",
    Bienestar: "bg-gold text-foreground",
    Gastronomía: "bg-earth text-cream-light",
    Naturaleza: "bg-forest-light text-cream-light",
    Romance: "bg-cta text-white",
    Sostenibilidad: "bg-primary text-primary-foreground",
};
