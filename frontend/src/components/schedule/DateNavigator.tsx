import React from 'react';
import { Button, Space, Typography, DatePicker } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { STRINGS } from '../../constants/strings';

// dayjs 한국어 설정
dayjs.locale('ko');

interface DateNavigatorProps {
    currentDate: Date;
    onPrev: () => void;
    onNext: () => void;
    onToday: () => void; // 오늘 날짜로 이동하는 함수
    onDateSelect?: (date: Date) => void;
    viewType: string;
}

/**
 * DateNavigator
 * 
 * @description
 * 캘린더 상단에서 날짜를 이전/다음으로 이동하고 현재 날짜를 표시하는 네비게이션바입니다.
 * STRINGS 상수를 철저히 사용합니다.
 */
const DateNavigator: React.FC<DateNavigatorProps> = ({ currentDate, onPrev, onNext, onToday, onDateSelect, viewType }) => {
    // 날짜 텍스트 계산
    const getDateText = () => {
        if (viewType === 'timeGridWeek') {
            const start = dayjs(currentDate).startOf('week');
            const end = dayjs(currentDate).endOf('week');
            return `${start.format('MM월 DD일')} ~ ${end.format('MM월 DD일')}`;
        }
        return dayjs(currentDate).format(STRINGS.SCHEDULE.DATE_FORMAT);
    };

    // 버튼 텍스트 계산
    const getButtonText = () => {
        if (viewType === 'timeGridWeek') {
            return STRINGS.SCHEDULE.CALENDAR.THIS_WEEK;
        }
        return STRINGS.SCHEDULE.CALENDAR.TODAY;
    };

    return (
        <Space align="center" size="middle">
            <Button
                type="text"
                icon={<LeftOutlined />}
                onClick={onPrev}
            />

            <div style={{ position: 'relative' }}>
                <Typography.Title
                    level={4}
                    style={{ margin: 0, minWidth: 200, textAlign: 'center', cursor: 'pointer' }}
                    onClick={() => {
                        // Trigger DatePicker (How? We can render it absolute or use a ref?)
                        // Easier: Render a DatePicker with style opacity 0 on top?
                        // Or just render DatePicker and customize input?
                    }}
                >
                    {getDateText()}
                </Typography.Title>
                {onDateSelect && (
                    <DatePicker
                        value={dayjs(currentDate)}
                        onChange={(date) => {
                            if (date) onDateSelect(date.toDate());
                        }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer'
                        }}
                        allowClear={false}
                    />
                )}
            </div>

            <Button
                type="text"
                icon={<RightOutlined />}
                onClick={onNext}
            />

            <Button onClick={onToday}>
                {getButtonText()}
            </Button>
        </Space>
    );
};

export default DateNavigator;
