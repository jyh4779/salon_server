export class CreateMenuDto {
    category?: string;
    name: string;
    price: number;
    duration: number; // in minutes
    description?: string;
}
