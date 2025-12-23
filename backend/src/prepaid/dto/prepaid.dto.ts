import { IsString, IsInt, IsOptional, IsBoolean } from 'class-validator';

export class CreateTicketDto {
    @IsString()
    name: string;

    @IsInt()
    price: number;

    @IsInt()
    credit_amount: number;

    @IsOptional()
    @IsInt()
    validity_days?: number;
}

export class ChargePrepaidDto {
    @IsOptional()
    @IsInt() // ID from PREPAID_TICKETS
    ticketId?: number;

    @IsOptional()
    @IsInt()
    amount?: number; // Manual charge amount

    @IsOptional()
    @IsInt()
    bonusAmount?: number; // Manual bonus

    @IsOptional()
    @IsString()
    paymentMethod?: 'CARD' | 'CASH'; // 'CARD' or 'CASH'
}
