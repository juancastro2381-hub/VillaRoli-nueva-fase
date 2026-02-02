import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ArrowRight, Calendar, User } from "lucide-react";
import fincaVistaAerea from "@/assets/finca-vista-aerea1.jpg";
import { BLOG_POSTS, CATEGORY_COLORS } from "@/data/blog";
import { SingleBlogView } from "@/components/blog/SingleBlogView";
import { useEffect } from "react";

const Blog = () => {
  const { slug } = useParams();

  // Scroll to top when slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // If slug exists, try to find the post
  if (slug) {
    const post = BLOG_POSTS.find((p) => p.slug === slug);
    if (post) {
      return (
        <Layout>
          <SingleBlogView post={post} />
        </Layout>
      );
    }
    // If post not found, we could redirect or show 404, 
    // but for now we fall back to the list view (or could render a specific 'Not Found' message)
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={fincaVistaAerea}
            alt="Blog Villa Roli"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
        </div>

        <div className="relative z-10 container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 bg-cta/20 backdrop-blur-sm rounded-full text-gold font-body text-sm tracking-wider uppercase mb-4">
              Blog
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-cream-light">
              Historias & Consejos
            </h1>
            <p className="font-body text-cream-light/80 text-lg mt-4 max-w-2xl mx-auto">
              Inspiración para tu próxima aventura. Consejos de viaje, guías
              locales y todo lo que necesitas saber para disfrutar al máximo tu
              estadía.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BLOG_POSTS.map((post, index) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <Link to={`/blog/${post.slug}`} className="block h-full">
                  <div className="bg-card rounded-2xl overflow-hidden border border-border hover:border-cta/50 transition-all duration-500 hover:shadow-xl h-full flex flex-col">
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-4 left-4">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${CATEGORY_COLORS[post.category]}`}
                        >
                          {post.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h2 className="font-display text-xl font-semibold text-foreground group-hover:text-cta transition-colors mb-3 line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="font-body text-muted-foreground leading-relaxed mb-4 line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {post.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {post.date}
                          </span>
                        </div>
                        <ArrowRight
                          size={18}
                          className="text-cta transition-transform group-hover:translate-x-1"
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
