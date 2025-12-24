export class AppShopResponseDto {
    shop_id: number;
    name: string;
    tel: string;
    address: string;
    open_time: string;
    close_time: string;
    closed_days: string;
    // Exclude settlement info, owner info, etc.
}
