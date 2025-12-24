export class CreateMobileUserDto {
    firebaseToken: string;
    name: string;
    phone: string; // From Firebase or Input
    birthdate?: string; // YYYYMMDD
    gender?: 'MALE' | 'FEMALE';
}
