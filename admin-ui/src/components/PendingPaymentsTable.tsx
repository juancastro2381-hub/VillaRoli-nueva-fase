import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Eye,
    CheckCircle2,
    XCircle,
    FileImage,
    Calendar,
    User,
    DollarSign,
    RefreshCw,
} from 'lucide-react';
import { type PendingPayment } from '@/hooks/usePendingPayments';
import { EvidencePreviewModal } from './EvidencePreviewModal';

interface PendingPaymentsTableProps {
    payments: PendingPayment[];
    loading: boolean;
    error: string | null;
    onRefresh: () => void;
    onPaymentConfirmed?: (paymentId: number) => void;
    onPaymentRejected?: (paymentId: number) => void;
}

export function PendingPaymentsTable({
    payments,
    loading,
    error,
    onRefresh,
    onPaymentConfirmed,
    onPaymentRejected,
}: PendingPaymentsTableProps) {
    const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const formatAmount = (amount: number, currency: string = 'COP') => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-CO', {
            dateStyle: 'short',
            timeStyle: 'short',
        }).format(date);
    };

    const getPaymentMethodBadge = (method: string) => {
        const methods: Record<string, { label: string; variant: 'default' | 'secondary' }> = {
            BANK_TRANSFER: { label: 'Transferencia', variant: 'default' },
            DIRECT_ADMIN_AGREEMENT: { label: 'Acuerdo Directo', variant: 'secondary' },
        };

        const config = methods[method] || { label: method, variant: 'secondary' };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const handleViewEvidence = (payment: PendingPayment) => {
        setSelectedPayment(payment);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedPayment(null);
    };

    const handleConfirm = (paymentId: number) => {
        if (onPaymentConfirmed) {
            onPaymentConfirmed(paymentId);
        }
        handleModalClose();
    };

    const handleReject = (paymentId: number) => {
        if (onPaymentRejected) {
            onPaymentRejected(paymentId);
        }
        handleModalClose();
    };

    if (error) {
        return (
            <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <FileImage className="h-5 w-5" />
                                Pagos Pendientes de Verificación
                            </CardTitle>
                            <CardDescription>
                                Pagos que requieren revisión de comprobante o aprobación directa
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRefresh}
                            disabled={loading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Actualizar
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                            <h3 className="text-lg font-semibold">¡Todo al día!</h3>
                            <p className="text-muted-foreground mt-2">
                                No hay pagos pendientes de verificación
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableCaption>
                                {payments.length} pago{payments.length !== 1 ? 's' : ''} pendiente
                                {payments.length !== 1 ? 's' : ''}
                            </TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Monto</TableHead>
                                    <TableHead>Método</TableHead>
                                    <TableHead>Comprobante</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.map((payment) => (
                                    <TableRow key={payment.payment_id}>
                                        <TableCell className="font-mono text-sm">
                                            #{payment.payment_id}
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium">
                                                        {payment.booking?.guest_name || 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Reserva #{payment.booking_id}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="h-4 w-4 text-green-600" />
                                                <span className="font-semibold">
                                                    {formatAmount(payment.amount, payment.currency)}
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            {getPaymentMethodBadge(payment.payment_method)}
                                        </TableCell>

                                        <TableCell>
                                            {payment.evidence_url ? (
                                                <Badge variant="outline" className="bg-blue-50">
                                                    <FileImage className="h-3 w-3 mr-1" />
                                                    Disponible
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-gray-50">
                                                    Sin comprobante
                                                </Badge>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(payment.evidence_uploaded_at || payment.created_at)}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewEvidence(payment)}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Revisar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Evidence Preview Modal */}
            {selectedPayment && (
                <EvidencePreviewModal
                    payment={selectedPayment}
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    onConfirm={() => handleConfirm(selectedPayment.payment_id)}
                    onReject={() => handleReject(selectedPayment.payment_id)}
                />
            )}
        </>
    );
}
