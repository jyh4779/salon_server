import { IsOptional, IsString } from 'class-validator';

export class UpdateShopDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    tel?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    open_time?: string; // HH:mm:ss or HH:mm

    @IsOptional()
    @IsString()
    close_time?: string;

    @IsOptional()
    @IsString()
    closed_days?: string; // "Mon,Tue" etc.
}
