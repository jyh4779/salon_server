import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreateMenuDto {
    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    name: string;

    @IsNumber()
    @IsOptional()
    price?: number;

    @IsNumber()
    @IsOptional()
    duration?: number; // in minutes

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    thumbnail_url?: string;

    @IsEnum(['MENU', 'CATEGORY'])
    @IsOptional()
    type?: 'MENU' | 'CATEGORY';

    @IsNumber()
    @IsOptional()
    sort_order?: number;
}
