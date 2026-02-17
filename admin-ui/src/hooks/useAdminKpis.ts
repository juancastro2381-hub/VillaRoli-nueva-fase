import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

export interface KPIStats {
    total_bookings: number;
    monthly_revenue: number;
    active_bookings: number;
    occupancy_rate: number;
}

interface UseAdminKpisResult {
    kpis: KPIStats;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useAdminKpis(): UseAdminKpisResult {
    const [kpis, setKpis] = useState<KPIStats>({
        total_bookings: 0,
        monthly_revenue: 0,
        active_bookings: 0,
        occupancy_rate: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchKpis = useCallback(async () => {
        try {
            const response = await api.get('/admin/kpis');
            setKpis(response.data);
            setError(null);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Error loading PCBs';
            setError(errorMessage);
            console.error('Error loading KPIs:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchKpis();
    }, [fetchKpis]);

    return { kpis, loading, error, refetch: fetchKpis };
}
