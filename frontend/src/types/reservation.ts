export interface ReservationDTO {
    reservation_id: number;
    shop_id: number;
    customer_id: number;
    designer_id: number;
    start_time: string;
    end_time: string;
    status: ReservationStatus;
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
    RESERVATION_ITEMS: {
        item_id: number;
        menu_name: string;
        price: number;
    }[];
}

export interface GetReservationsParams {
    startDate: string;
    endDate: string;
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED' | 'NOSHOW';

export interface CreateReservationDTO {
    shop_id: number;
    customer_id?: number;
    customer_name?: string;
    customer_phone?: string;
    designer_id: number;
    start_time: string;
    end_time: string;
    status: ReservationStatus;
    request_memo?: string;
    alarm_enabled?: boolean;
    treatment_id?: number;
}
