import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { MessageSquare, Check, X, Trash2, Star } from 'lucide-react';
import { useState } from 'react';

interface Testimonial {
    id: number;
    name: string;
    city: string;
    rating: number;
    comment: string;
    is_approved: boolean;
    created_at: string;
}

export default function ContentTestimonials() {
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [newReview, setNewReview] = useState({ name: '', comment: '', rating: 5, city: '' });

    const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
        queryKey: ['testimonials'],
        queryFn: async () => {
            const res = await api.get('/admin/content/testimonials');
            return res.data;
        }
    });

    const updateStatus = useMutation({
        mutationFn: async ({ id, approved }: { id: number; approved: boolean }) => {
            await api.patch(`/admin/content/testimonials/${id}`, { is_approved: approved });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['testimonials'] })
    });

    const deleteReview = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/admin/content/testimonials/${id}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['testimonials'] })
    });

    const createReview = useMutation({
        mutationFn: async () => {
            await api.post('/admin/content/testimonials', newReview);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['testimonials'] });
            setIsCreating(false);
            setNewReview({ name: '', comment: '', rating: 5, city: '' });
        }
    });

    if (isLoading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <MessageSquare /> Testimonios
                </h2>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    {isCreating ? 'Cancelar' : 'Agregar Manualmente'}
                </button>
            </div>

            {isCreating && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-blue-200">
                    <h3 className="font-semibold mb-3">Nuevo Testimonio</h3>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                        <input
                            placeholder="Nombre"
                            className="p-2 border rounded"
                            value={newReview.name}
                            onChange={e => setNewReview({ ...newReview, name: e.target.value })}
                        />
                        <input
                            placeholder="Ciudad"
                            className="p-2 border rounded"
                            value={newReview.city}
                            onChange={e => setNewReview({ ...newReview, city: e.target.value })}
                        />
                        <input
                            type="number"
                            min="1" max="5"
                            placeholder="Rating"
                            className="p-2 border rounded"
                            value={newReview.rating}
                            onChange={e => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                        />
                    </div>
                    <textarea
                        placeholder="Comentario"
                        className="w-full p-2 border rounded mb-3"
                        rows={3}
                        value={newReview.comment}
                        onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                    />
                    <button
                        onClick={() => createReview.mutate()}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        Guardar
                    </button>
                </div>
            )}

            <div className="grid gap-4">
                {testimonials?.map((t) => (
                    <div key={t.id} className={`bg-white p-4 rounded-lg shadow border-l-4 ${t.is_approved ? 'border-green-500' : 'border-yellow-500'
                        }`}>
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-lg">{t.name}</h3>
                                    <span className="text-gray-500 text-sm">• {t.city || 'Web'}</span>
                                    <div className="flex text-yellow-500">
                                        {[...Array(t.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                    </div>
                                </div>
                                <p className="text-gray-700 italic">"{t.comment}"</p>
                                <div className="text-xs text-gray-400 mt-2">
                                    {t.created_at} • Estado: {t.is_approved ? 'APROBADO' : 'PENDIENTE'}
                                </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                                <button
                                    onClick={() => updateStatus.mutate({ id: t.id, approved: !t.is_approved })}
                                    className={`p-2 rounded ${t.is_approved ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}
                                    title={t.is_approved ? "Ocultar" : "Aprobar"}
                                >
                                    {t.is_approved ? <X size={20} /> : <Check size={20} />}
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('¿Eliminar testimonio?')) deleteReview.mutate(t.id);
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                    title="Eliminar"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
