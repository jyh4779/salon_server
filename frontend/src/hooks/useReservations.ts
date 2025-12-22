import { useQuery } from '@tanstack/react-query';
import { getReservations } from '../api/reservations';
import { GetReservationsParams } from '../types/reservation';

export const useReservations = (shopId: number | null, params: GetReservationsParams) => {
    return useQuery({
        queryKey: ['reservations', shopId, params],
        queryFn: () => shopId ? getReservations(shopId, params) : Promise.resolve([]),
        enabled: !!shopId,
        // Keep data fresh for 1 minute
        staleTime: 60 * 1000,
    });
};
