import { IsString } from 'class-validator';

export class GetReservationsDto {
    @IsString()
    startDate: string;

    @IsString()
    endDate: string;
}
