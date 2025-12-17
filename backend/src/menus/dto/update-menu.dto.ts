import { PartialType } from '@nestjs/mapped-types'; // NestJS mapped types usually need a package, but for now I'll just manual partial or export class
// Installing @nestjs/mapped-types might be needed. Checking if user has it.
// If not, just `export class UpdateMenuDto { ... }` with optional fields.

export class UpdateMenuDto {
    category?: string;
    name?: string;
    price?: number;
    duration?: number;
    description?: string;
    is_deleted?: boolean;
}
