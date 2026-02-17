import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

export interface RevenueSummary {
    total_revenue: number;
    total_bookings_confirmed: number;
    currency: string;
    revenue_by_plan: Record<string, number>;
    revenue_by_payment_method: Record<string, number>;
    revenue_by_channel: Record<string, number>;
    date_range: {
        from: string;
        to: string;
    };
}

interface UseFinanceSummaryResult {
    summary: RevenueSummary | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useFinanceSummary(): UseFinanceSummaryResult {
    const [summary, setSummary] = useState<RevenueSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSummary = useCallback(async () => {
        try {
            const response = await api.get('/admin/finance/summary');
            setSummary(response.data);
            setError(null);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Error loading financial summary';
            setError(errorMessage);
            console.error('Error loading financial summary:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    return { summary, loading, error, refetch: fetchSummary };
}
