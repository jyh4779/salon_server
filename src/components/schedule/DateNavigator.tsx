import React from 'react';
import { Button, Space, Typography } from 'antd';
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
}

/**
 * DateNavigator
 * 
 * @description
 * 캘린더 상단에서 날짜를 이전/다음으로 이동하고 현재 날짜를 표시하는 네비게이션바입니다.
 * STRINGS 상수를 철저히 사용합니다.
 */
const DateNavigator: React.FC<DateNavigatorProps> = ({ currentDate, onPrev, onNext, onToday }) => {
    return (
        <Space align="center" size="middle">
            <Button
                type="text"
                icon={<LeftOutlined />}
                onClick={onPrev}
            />

            <Typography.Title level={4} style={{ margin: 0, minWidth: 200, textAlign: 'center', cursor: 'pointer' }}>
                {dayjs(currentDate).format(STRINGS.SCHEDULE.DATE_FORMAT)}
            </Typography.Title>

            <Button
                type="text"
                icon={<RightOutlined />}
                onClick={onNext}
            />

            <Button onClick={onToday}>
                {STRINGS.SCHEDULE.CALENDAR.TODAY}
            </Button>
        </Space>
    );
};

export default DateNavigator;
