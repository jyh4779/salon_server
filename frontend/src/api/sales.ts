import { api } from './client';

export interface DailySalesStats {
    totalSales: number;
    cardSales: number;
    cashSales: number;
    depositSales: number;
    count: number;
}

export interface SalesTransaction {
    id: number;
    time: string;
    customer: string;
    customerId: number;
    designer: string;
    menus: string;
    totalPrice: number;
    paymentType: string;
}

export interface DesignerSalesStats {
    name: string;
    totalSales: number;
    count: number;
}

export interface MenuSalesStats {
    name: string;
    totalSales: number;
    count: number;
}

export interface DailySalesData {
    date: string;
    stats: DailySalesStats;
    designerStats: DesignerSalesStats[];
    menuStats: MenuSalesStats[];
    reservations: SalesTransaction[];
}

export const getDailySales = async (shopId: number, date: string): Promise<DailySalesData> => {
    const response = await api.get(`/shops/${shopId}/sales/daily`, {
        params: { date }
    });
    return response.data;
};
