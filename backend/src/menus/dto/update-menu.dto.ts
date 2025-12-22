import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export class UpdateMenuDto {
    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsNumber()
    @IsOptional()
    price?: number;

    @IsNumber()
    @IsOptional()
    duration?: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    @IsOptional()
    is_deleted?: boolean;

    @IsEnum(['MENU', 'CATEGORY'])
    @IsOptional()
    type?: 'MENU' | 'CATEGORY';

    @IsNumber()
    @IsOptional()
    sort_order?: number;
}
