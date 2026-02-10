import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { BookOpen, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface BlogPost {
    id: number;
    slug: string;
    title: string;
    content: string;
    status: string;
    published_at: string;
}

export default function ContentBlog() {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [formData, setFormData] = useState({ slug: '', title: '', content: '', status: 'DRAFT' });

    const { data: posts, isLoading } = useQuery<BlogPost[]>({
        queryKey: ['blog'],
        queryFn: async () => {
            const res = await api.get('/admin/content/blog');
            return res.data;
        }
    });

    const createPost = useMutation({
        mutationFn: async (data: any) => {
            await api.post('/admin/content/blog', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blog'] });
            resetForm();
        }
    });

    const updatePost = useMutation({
        mutationFn: async (data: any) => {
            await api.patch(`/admin/content/blog/${isEditing}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blog'] });
            resetForm();
        }
    });

    const deletePost = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/admin/content/blog/${id}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blog'] })
    });

    const resetForm = () => {
        setIsEditing(null);
        setFormData({ slug: '', title: '', content: '', status: 'DRAFT' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            updatePost.mutate(formData);
        } else {
            createPost.mutate(formData);
        }
    };

    const handleEdit = (post: BlogPost) => {
        setIsEditing(post.id);
        setFormData({
            slug: post.slug,
            title: post.title,
            content: post.content,
            status: post.status
        });
    };

    if (isLoading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BookOpen /> Blog Posts
            </h2>

            {/* Editor Form */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h3 className="text-lg font-semibold mb-4">{isEditing ? 'Editar Post' : 'Nuevo Post'}</h3>
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            placeholder="Título"
                            className="p-2 border rounded"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                        <input
                            placeholder="Slug (URL)"
                            className="p-2 border rounded"
                            value={formData.slug}
                            onChange={e => setFormData({ ...formData, slug: e.target.value })}
                            required
                        />
                    </div>
                    <textarea
                        placeholder="Contenido (Markdown soportado)"
                        className="p-2 border rounded h-40 font-mono text-sm"
                        value={formData.content}
                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                        required
                    />
                    <div className="flex justify-between items-center">
                        <select
                            className="p-2 border rounded"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="DRAFT">Borrador</option>
                            <option value="PUBLISHED">Publicado</option>
                        </select>

                        <div className="flex gap-2">
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancelar
                                </button>
                            )}
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                {isEditing ? 'Actualizar' : 'Crear Post'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {posts?.map((post) => (
                    <div key={post.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg">{post.title}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${post.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {post.status}
                                </span>
                            </div>
                            <div className="text-sm text-gray-500">
                                /{post.slug} • {post.published_at || 'Sin publicar'}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(post)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            >
                                <Edit size={20} />
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm('¿Eliminar post?')) deletePost.mutate(post.id);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
