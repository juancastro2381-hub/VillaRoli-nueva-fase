import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Comment {
    id: string;
    author: string;
    avatar?: string;
    date: string;
    content: string;
}

// Mock initial comments (could also be in data layer)
const INITIAL_COMMENTS: Comment[] = [
    {
        id: "1",
        author: "Laura Muñoz",
        date: "Hace 2 días",
        content: "¡Excelente información! Me encantaría visitar la Cascada del Amor en mi próximo viaje.",
    },
    {
        id: "2",
        author: "Andrés Felipe",
        date: "Hace 1 semana",
        content: "Las cabañas se ven increíbles. ¿Es necesario reservar con mucha anticipación?",
    },
];

export const CommentsSection = () => {
    const { toast } = useToast();
    const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
    const [newComment, setNewComment] = useState({ author: "", content: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.author.trim() || !newComment.content.trim()) return;

        setIsSubmitting(true);

        // Simulate network delay
        setTimeout(() => {
            const comment: Comment = {
                id: Date.now().toString(),
                author: newComment.author,
                date: "Justo ahora",
                content: newComment.content,
            };

            setComments((prev) => [comment, ...prev]);
            setNewComment({ author: "", content: "" });
            setIsSubmitting(false);

            toast({
                title: "Comentario publicado",
                description: "Gracias por compartir tu opinión.",
            });
        }, 600);
    };

    return (
        <div className="mt-12 pt-12 border-t border-border">
            <h3 className="font-display text-2xl font-bold mb-8 flex items-center gap-2">
                <MessageSquare className="text-gold" />
                Comentarios ({comments.length})
            </h3>

            {/* Comment Form */}
            <div className="bg-card rounded-xl p-6 mb-10 border border-border shadow-sm">
                <h4 className="font-semibold mb-4 text-foreground">Deja un comentario</h4>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Input
                            placeholder="Tu nombre"
                            value={newComment.author}
                            onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
                            className="bg-background mb-3"
                            required
                        />
                        <Textarea
                            placeholder="Escribe tu comentario aquí..."
                            value={newComment.content}
                            onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                            className="bg-background resize-none"
                            rows={3}
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting || !newComment.content.trim()}>
                            <Send size={16} className="mr-2" />
                            {isSubmitting ? "Publicando..." : "Publicar Comentario"}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 p-4 rounded-xl bg-background/50">
                        <Avatar>
                            <AvatarImage src={comment.avatar} />
                            <AvatarFallback className="bg-cta/10 text-cta font-bold">
                                {comment.author.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <h5 className="font-semibold text-foreground">{comment.author}</h5>
                                <span className="text-xs text-muted-foreground">{comment.date}</span>
                            </div>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {comment.content}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
