import { IsBoolean, IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateReservationDto {
    @IsInt()
    shop_id: number;

    @IsInt()
    customer_id: number;

    @IsOptional()
    @IsString()
    customer_name?: string;

    @IsOptional()
    @IsString()
    customer_phone?: string;

    @IsInt()
    designer_id: number;

    @IsDateString()
    start_time: string;

    @IsDateString()
    end_time: string;

    @IsString()
    status: string; // RESERVATIONS_status enum

    @IsOptional()
    @IsString()
    request_memo?: string;

    @IsOptional()
    @IsBoolean()
    alarm_enabled?: boolean;

    @IsOptional()
    @IsInt()
    treatment_id?: number; // RESERVATION_ITEMS에 저장될 메뉴 ID

    @IsOptional()
    @IsInt()
    price?: number; // 메뉴 가격 (직접 입력 가능)
}
