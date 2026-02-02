import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Share2 } from "lucide-react";
import { BlogPost, CATEGORY_COLORS } from "@/data/blog";
import { Button } from "@/components/ui/button";
import { CommentsSection } from "./CommentsSection";
import { Badge } from "@/components/ui/badge";

interface SingleBlogViewProps {
    post: BlogPost;
}

export const SingleBlogView = ({ post }: SingleBlogViewProps) => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: post.title,
                text: post.excerpt,
                url: window.location.href,
            }).catch(console.error);
        } else {
            // Fallback copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            // Ideally show a toast here, but for simplicity of this component we skip it or assume parent handles context
        }
    };

    return (
        <>
            {/* Article Header (Hero) */}
            <div className="relative h-[60vh] min-h-[400px]">
                <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
                    <div className="container-custom">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="max-w-4xl"
                        >
                            <div className="flex flex-wrap gap-3 mb-6">
                                <Link to="/blog">
                                    <Badge variant="outline" className="bg-background/20 backdrop-blur-md text-white border-white/30 hover:bg-background/40 pl-2 cursor-pointer transition-colors">
                                        <ArrowLeft size={14} className="mr-1" />
                                        Volver al Blog
                                    </Badge>
                                </Link>
                                <Badge className={`${CATEGORY_COLORS[post.category]} border-none`}>
                                    {post.category}
                                </Badge>
                            </div>

                            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                                {post.title}
                            </h1>

                            <div className="flex items-center gap-6 text-white/90">
                                <span className="flex items-center gap-2 text-sm md:text-base">
                                    <User size={18} className="text-gold" />
                                    {post.author}
                                </span>
                                <span className="flex items-center gap-2 text-sm md:text-base">
                                    <Calendar size={18} className="text-gold" />
                                    {post.date}
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="container-custom section-padding">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="lg:col-span-8 content-wrapper"
                    >
                        {/* Article Body */}
                        <article
                            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-p:font-body prose-p:text-muted-foreground prose-a:text-cta hover:prose-a:text-cta/80 prose-img:rounded-2xl"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {/* Tags / Share */}
                        <div className="mt-12 py-8 border-t border-border flex justify-between items-center">
                            <p className="text-sm text-muted-foreground font-body">
                                Etiquetas: <span className="text-foreground font-medium">{post.category}, Villa Roli, Naturaleza</span>
                            </p>
                            <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                                <Share2 size={16} />
                                Compartir
                            </Button>
                        </div>

                        {/* Comments */}
                        <CommentsSection />
                    </motion.div>

                    {/* Sidebar (Optional - could be related posts, CTA, etc) */}
                    <aside className="lg:col-span-4 space-y-8">
                        <div className="bg-card rounded-2xl p-8 border border-border sticky top-32">
                            <h3 className="font-display text-2xl font-bold mb-4">¿Te gustó el artículo?</h3>
                            <p className="text-muted-foreground mb-6">
                                Ven a vivir la experiencia Villa Roli en persona. Reserva tu estadía hoy mismo.
                            </p>
                            <Button asChild className="w-full font-bold">
                                <Link to="/reservas">Reservar Ahora</Link>
                            </Button>
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
};
