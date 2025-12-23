import { IsString, IsNotEmpty, IsOptional, IsEnum, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';
import { USERS_gender, USERS_role } from '@prisma/client';

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

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    password?: string;

    @IsString()
    @IsOptional()
    role?: USERS_role; // Allow role override for testing/admin
}
