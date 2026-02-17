import { useEffect, useState } from 'react';
import api from '../lib/api';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'; // Removed, using api client

export interface PendingPayment {
    payment_id: number;
    booking_id: number;
    amount: number;
    currency: string;
    status: string;
    payment_method: string;
    evidence_url: string | null;
    evidence_uploaded_at: string | null;
    created_at: string | null;
    booking: {
        id: number;
        guest_name: string;
        guest_email: string;
        check_in: string;
        check_out: string;
        status: string;
    } | null;
}

interface UsePendingPaymentsResult {
    payments: PendingPayment[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Hook to fetch and poll pending payments for admin review
 * @param refreshInterval Polling interval in milliseconds (default: 30000 = 30 seconds)
 * @param autoRefresh Enable automatic polling (default: true)
 */
export function usePendingPayments(
    refreshInterval: number = 30000,
    autoRefresh: boolean = true
): UsePendingPaymentsResult {
    const [payments, setPayments] = useState<PendingPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPayments = async () => {
        try {
            // Using centralized api client handles Authorization header automatically
            const response = await api.get('/admin/payments/pending');
            setPayments(response.data.pending_payments || []);
            setError(null);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
            setError(errorMessage);
            console.error('Error fetching pending payments:', err);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchPayments();
    }, []);

    // Polling
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            fetchPayments();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [refreshInterval, autoRefresh]);

    return {
        payments,
        loading,
        error,
        refetch: fetchPayments,
    };
}
