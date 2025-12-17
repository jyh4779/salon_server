import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export enum PaymentType {
    APP_DEPOSIT = 'APP_DEPOSIT',
    SITE_CARD = 'SITE_CARD',
    SITE_CASH = 'SITE_CASH'
}

export class CompleteReservationDto {
    @IsInt()
    @Min(0)
    totalPrice: number;

    @IsEnum(PaymentType)
    paymentType: PaymentType;

    @IsString()
    @IsOptional()
    paymentMemo?: string;
}
