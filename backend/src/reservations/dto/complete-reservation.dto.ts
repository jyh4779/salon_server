import { IsEnum, IsInt, IsOptional, IsString, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentType {
    APP_DEPOSIT = 'APP_DEPOSIT',
    SITE_CARD = 'SITE_CARD',
    SITE_CASH = 'SITE_CASH',
    PREPAID = 'PREPAID'
}

class PaymentDetail {
    @IsEnum(PaymentType)
    paymentType: PaymentType;

    @IsInt()
    @Min(0)
    amount: number;
}

export class CompleteReservationDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PaymentDetail)
    payments: PaymentDetail[];

    @IsInt()
    @Min(0)
    totalPrice: number;

    @IsString()
    @IsOptional()
    paymentMemo?: string;
}
