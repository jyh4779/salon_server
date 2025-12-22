import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateDesignerDto {
    @IsOptional()
    @IsString()
    intro_text?: string;

    @IsOptional()
    @IsString()
    work_start?: string; // HH:mm

    @IsOptional()
    @IsString()
    work_end?: string;

    @IsOptional()
    @IsString()
    lunch_start?: string;

    @IsOptional()
    @IsString()
    lunch_end?: string;

    @IsOptional()
    @IsString()
    day_off?: string; // "Mon,Tue"

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    profile_img?: string;
}
