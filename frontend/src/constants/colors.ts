export const COLORS = {
    PRIMARY: '#1677ff', // Ant Design Default Blue
    SUCCESS: '#52c41a',
    WARNING: '#faad14',
    ERROR: '#ff4d4f',

    // 예약 상태 (Reservation Status)
    STATUS: {
        PENDING: '#faad14',   // 대기
        CONFIRMED: '#1677ff', // 확정
        TREATING: '#722ed1',  // 시술중
        COMPLETED: '#8c8c8c', // 완료 (Gray)
        CANCELED: '#d9d9d9',  // 취소
        NOSHOW: '#ff4d4f',    // 노쇼 (Red)
    },

    TEXT: {
        PRIMARY: '#000000',
        SECONDARY: 'rgba(0, 0, 0, 0.45)',
    },

    STATS: {
        POSITIVE: '#3f8600', // 매출 증가, 이익 등
        NEGATIVE: '#cf1322', // 합계, 강조 등
    },

    BACKGROUND: {
        LIGHT: '#fafafa',
        WHITE: '#ffffff',
    },

    CALENDAR: {
        UNAVAILABLE: '#8c8c8c', // 예약 불가 (휴무, 점심시간)
        HOLIDAY: '#8c8c8c', // Old Red removed, unified
    },

    CHARTS: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']
};
