export class UpdateDesignerDto {
    intro_text?: string;
    work_start?: string; // HH:mm
    work_end?: string;
    lunch_start?: string;
    lunch_end?: string;
    day_off?: string; // "Mon,Tue"
    is_active?: boolean;
}
