import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDesignerDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    phone: string;

    @IsOptional()
    @IsString()
    intro_text?: string;

    @IsOptional()
    @IsString()
    profile_img?: string;
}
