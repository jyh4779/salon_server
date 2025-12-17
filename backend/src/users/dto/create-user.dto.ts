import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { USERS_gender } from '@prisma/client';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => value.replace(/[^0-9]/g, ''))
    phone: string;

    @IsEnum(USERS_gender)
    @IsOptional()
    gender?: USERS_gender;

    @IsString()
    @IsOptional()
    birthdate?: string; // YYYYMMDD

    @IsString()
    @IsOptional()
    memo?: string;
}
