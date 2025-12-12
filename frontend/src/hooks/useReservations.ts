import { useQuery } from '@tanstack/react-query';
import { getReservations } from '../api/reservations';
import { GetReservationsParams } from '../types/reservation';

export const useReservations = (params: GetReservationsParams) => {
    return useQuery({
        queryKey: ['reservations', params],
        queryFn: () => getReservations(params),
        // Keep data fresh for 1 minute
        staleTime: 60 * 1000,
    });
};
