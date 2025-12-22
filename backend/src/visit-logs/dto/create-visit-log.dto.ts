import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateVisitLogDto {
    @IsNumber()
    customer_id: number;

    @IsNumber()
    reservation_id: number;

    @IsNumber()
    designer_id: number;

    @IsString()
    @IsOptional()
    admin_memo?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    photo_urls?: string[];
}
