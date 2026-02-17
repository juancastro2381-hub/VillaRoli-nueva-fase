import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PaymentActionsProps {
    paymentId: number;
    bookingId: number;
    onConfirm: () => void;
    onReject: () => void;
    isProcessing?: boolean;
}

import api from '../lib/api';
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function PaymentActions({
    paymentId,
    bookingId,
    onConfirm,
    onReject,
    isProcessing = false,
}: PaymentActionsProps) {
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [confirming, setConfirming] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const { toast } = useToast();

    const handleConfirm = async () => {
        setConfirming(true);
        try {
            await api.post(`/admin/payments/${paymentId}/confirm`);

            toast({
                title: '¡Pago Confirmado!',
                description: `Pago #${paymentId} aprobado exitosamente. Reserva #${bookingId} confirmada.`,
                duration: 5000,
            });

            onConfirm();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || error.message || 'No se pudo confirmar el pago',
                variant: 'destructive',
            });
        } finally {
            setConfirming(false);
        }
    };

    const handleRejectSubmit = async () => {
        if (!rejectReason.trim()) {
            toast({
                title: 'Razón requerida',
                description: 'Por favor proporciona una razón para el rechazo',
                variant: 'destructive',
            });
            return;
        }

        setRejecting(true);
        try {
            await api.post(`/admin/payments/${paymentId}/reject`, null, {
                params: { reason: rejectReason }
            });

            toast({
                title: 'Pago Rechazado',
                description: `Pago #${paymentId} rechazado. El cliente ha sido notificado.`,
                duration: 5000,
            });

            setShowRejectDialog(false);
            setRejectReason('');
            onReject();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || error.message || 'No se pudo rechazar el pago',
                variant: 'destructive',
            });
        } finally {
            setRejecting(false);
        }
    };

    const isDisabled = isProcessing || confirming || rejecting;

    return (
        <>
            <div className="flex items-center gap-3 w-full justify-end">
                <Button
                    variant="outline"
                    onClick={() => setShowRejectDialog(true)}
                    disabled={isDisabled}
                    className="text-destructive hover:text-destructive"
                >
                    {rejecting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Rechazar
                </Button>

                <Button
                    onClick={handleConfirm}
                    disabled={isDisabled}
                    className="bg-green-600 hover:bg-green-700"
                >
                    {confirming ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Aprobar Pago
                </Button>
            </div>

            {/* Reject Dialog */}
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Rechazar Pago</AlertDialogTitle>
                        <AlertDialogDescription>
                            Proporciona una razón clara para el rechazo. El cliente recibirá esta información.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4">
                        <Label htmlFor="reject-reason">Motivo del Rechazo *</Label>
                        <Input
                            id="reject-reason"
                            placeholder="Ej: Monto incorrecto, comprobante ilegible, etc."
                            value={rejectReason}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRejectReason(e.target.value)}
                            className="mt-2"
                            disabled={rejecting}
                        />
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={rejecting}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRejectSubmit}
                            disabled={rejecting || !rejectReason.trim()}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {rejecting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Rechazando...
                                </>
                            ) : (
                                'Confirmar Rechazo'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
