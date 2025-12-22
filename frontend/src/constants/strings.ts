export const STRINGS = {
    COMMON: {
        SAVE: '저장',
        CANCEL: '취소',
        DELETE: '삭제',
        CONFIRM: '확인',
        SEARCH: '검색',
        CLOSE: '닫기',
        EDIT: '수정',
        ADD: '추가',
    },
    MENU: {
        SCHEDULE: '일정 관리',
        CLIENT: '고객 관리',
        SALES: '매출 관리',
        SETTINGS: '설정',
    },
    SCHEDULE: {
        TITLE: '일정 관리',
        NEW_RESERVATION: '새 예약',
        DATE_FORMAT: 'MM월 DD일 (ddd)',
        CALENDAR: {
            TODAY: '오늘',
            MONTH: '월',
            WEEK: '주',
            DAY: '일',
            PREV: '이전',
            NEXT: '다음',
            VIEW_DAY: '일일',
            VIEW_WEEK: '주간',
            THIS_WEEK: '이번주',
        },
        // F-SCH-002 등 향후 확장을 위한 키
        STATUSED_PENDING: '예약 대기',
        STATUSED_CONFIRMED: '예약 확정',
        NEW_RESERVATION_MODAL: {
            TITLE: '새 예약 추가',
            CUSTOMER_LABEL: '고객명/연락처',
            CUSTOMER_PLACEHOLDER: '고객 검색 또는 입력',
            DATE_LABEL: '예약 날짜',
            TIME_LABEL: '예약 시간',
            TREATMENT_LABEL: '시술 메뉴',
            DESIGNER_LABEL: '담당 디자이너',
            STATUS_LABEL: '예약 상태',
            MEMO_LABEL: '메모',
            ALARM_LABEL: '알림 발송',
        },
    },
    CLIENT: {
        TITLE: '고객 관리',
        SEARCH_PLACEHOLDER: '고객 이름 혹은 전화번호',
        NEW_CLIENT: '신규 고객 추가',
        EXCEL_DOWNLOAD: '엑셀 다운로드',
        TABLE_HEADER: {
            NAME: '고객명',
            GENDER: '성별',
            PHONE: '연락처',
            LAST_VISIT: '최근 방문일',
            VISIT_COUNT: '방문횟수',
            NOSHOW_COUNT: '노쇼횟수',
            MEMO: '메모',
        }
    },
    SALES: {
        TITLE: '매출 관리',
    },
    SETTINGS: {
        TITLE: '설정',
    },
    UPLOAD: {
        ERROR_GENERIC: '업로드에 실패했습니다.',
        ERROR_EXT: 'JPG/PNG/WEBP 파일만 업로드 가능합니다!',
        ERROR_SIZE: '이미지 크기는 5MB보다 작아야 합니다!',
    }
};

export const RESERVATION_STATUS_COLORS = {
    PENDING: '#faad14',   // Orange (Wait)
    CONFIRMED: '#52c41a', // Green (Confirmed)
    COMPLETED: '#8c8c8c', // Gray (Completed) -- Following WEB-004 ex
    CANCELED: '#ff4d4f',  // Red (Cancelled)
    NOSHOW: '#cf1322',    // Dark Red (No Show) -- Following WEB-004 ex
};
