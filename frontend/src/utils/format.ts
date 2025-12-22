import dayjs from 'dayjs';

export const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3,4})(\d{4})$/);
    if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return phone;
};

export const formatDate = (date: string | Date | undefined, format: string = 'YYYY-MM-DD') => {
    if (!date) return '';
    return dayjs(date).format(format);
};

export const formatDateTime = (date: string | Date | undefined) => {
    if (!date) return '';
    return dayjs(date).format('YYYY-MM-DD HH:mm');
};

export const formatTime = (date: string | Date | undefined) => {
    if (!date) return '';
    return dayjs(date).format('HH:mm');
};
