export interface ReservationDTO {
    reservation_id: number;
    shop_id: number;
    customer_id: number;
    designer_id: number;
    start_time: string;
    end_time: string;
    status: string; // 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED' | 'NOSHOW'
    request_memo?: string;
    alarm_enabled?: boolean;
    created_at?: string;
    USERS: {
        name: string;
        phone: string;
    };
    DESIGNERS: {
        USERS: {
            name: string;
        };
    };
}

export interface GetReservationsParams {
    startDate: string;
    endDate: string;
}
