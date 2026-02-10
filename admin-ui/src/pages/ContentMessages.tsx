import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Mail, CheckCircle, Archive } from 'lucide-react';

interface ContactMessage {
    id: number;
    name: string;
    email: string;
    phone?: string;
    message: string;
    status: string;
    created_at: string;
}

export default function ContentMessages() {
    const queryClient = useQueryClient();

    const { data: messages, isLoading } = useQuery<ContactMessage[]>({
        queryKey: ['contacts'],
        queryFn: async () => {
            const res = await api.get('/admin/content/contacts');
            return res.data;
        }
    });

    const updateStatus = useMutation({
        mutationFn: async ({ id, status }: { id: number; status: string }) => {
            await api.patch(`/admin/content/contacts/${id}`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
        }
    });

    if (isLoading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Mail /> Mensajes de Contacto
            </h2>

            <div className="grid gap-4">
                {messages?.map((msg) => (
                    <div key={msg.id} className={`bg-white p-4 rounded-lg shadow border-l-4 ${msg.status === 'NEW' ? 'border-blue-500' :
                        msg.status === 'RESPONDED' ? 'border-green-500' : 'border-gray-500'
                        }`}>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-lg">{msg.name}</h3>
                                <div className="text-sm text-gray-600">
                                    <span className="mr-3">{msg.email}</span>
                                    {msg.phone && <span>{msg.phone}</span>}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">{msg.created_at}</div>
                            </div>
                            <div className="flex gap-2">
                                {msg.status !== 'RESPONDED' && (
                                    <button
                                        onClick={() => updateStatus.mutate({ id: msg.id, status: 'RESPONDED' })}
                                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                                        title="Marcar como Respondido"
                                    >
                                        <CheckCircle size={20} />
                                    </button>
                                )}
                                {msg.status !== 'ARCHIVED' && (
                                    <button
                                        onClick={() => updateStatus.mutate({ id: msg.id, status: 'ARCHIVED' })}
                                        className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                                        title="Archivar"
                                    >
                                        <Archive size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <p className="text-gray-800 bg-gray-50 p-3 rounded mt-2">
                            {msg.message}
                        </p>
                        <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Estado: {msg.status}
                        </div>
                    </div>
                ))}
                {messages?.length === 0 && (
                    <p className="text-gray-500 italic">No hay mensajes.</p>
                )}
            </div>
        </div>
    );
}
