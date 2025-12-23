import { api } from './client';

export interface DailySalesStats {
    totalSales: number;
    cardSales: number;
    cashSales: number;
    depositSales: number;
    count: number;
    cancelCount: number;
    noshowCount: number;
    newCustomerCount: number;
    returningCustomerCount: number;
    avgTicket: number;
}

export interface PaymentInfo {
    type: string;
    amount: number;
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
    payments: PaymentInfo[]; // Added detailed payments
    status: string; // Added status
}

export interface DesignerSalesStats {
    name: string;
    totalSales: number;
    count: number;
    avgTicket: number;
}

export interface MenuSalesStats {
    name: string;
    totalSales: number; // Backend sends value as well, but totalSales is essentially value or I should add value if needed by Recharts directly
    value: number; // Added for Recharts
    count: number;
}

export interface RevenueData {
    total: number;
    breakdown: {
        card: number;
        cash: number;
        prepaid: number;
    };
}

export interface CashFlowData {
    total: number;
    breakdown: {
        site_card: number;
        site_cash: number;
        prepaid_charge_card: number;
        prepaid_charge_cash: number;
    };
}

export interface DailySalesData {
    date: string;
    stats: DailySalesStats;
    revenue?: RevenueData;
    cashFlow?: CashFlowData;
    designerStats: DesignerSalesStats[];
    menuStats: MenuSalesStats[]; // Used for Category Chart
    reservations: SalesTransaction[];
}

export const getDailySales = async (shopId: number, date: string): Promise<DailySalesData> => {
    const response = await api.get(`/shops/${shopId}/sales/daily`, {
        params: { date }
    });
    return response.data;
};
