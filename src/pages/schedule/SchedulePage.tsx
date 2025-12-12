import React, { useState, useRef, useMemo } from 'react';
import { Layout, theme, Flex, Button, Segmented } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import FullCalendar from '@fullcalendar/react';
import dayjs from 'dayjs';
import DateNavigator from '../../components/schedule/DateNavigator';
import MainCalendar from '../../components/schedule/MainCalendar';
import { STRINGS, RESERVATION_STATUS_COLORS } from '../../constants/strings';
import { useReservations } from '../../hooks/useReservations';

const { Content } = Layout;

const SchedulePage: React.FC = () => {
    // Calendar Ref를 통해 API에 접근 (prev, next 등)
    const calendarRef = useRef<FullCalendar>(null);

    // 현재 보고 있는 날짜 상태
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [viewType, setViewType] = useState<string>('timeGridDay');

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    // Query Params 계산
    const queryParams = useMemo(() => {
        const current = dayjs(currentDate);
        let start, end;

        if (viewType === 'timeGridWeek') {
            start = current.startOf('week');
            end = current.endOf('week');
        } else {
            start = current.startOf('day');
            end = current.endOf('day');
        }

        return {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
        };
    }, [currentDate, viewType]);

    // 예약 데이터 조회
    const { data: reservations } = useReservations(queryParams);

    // FullCalendar Event 변환
    const events = useMemo(() => {
        if (!reservations) return [];
        return reservations.map(reservation => {
            const statusColor = RESERVATION_STATUS_COLORS[reservation.status as keyof typeof RESERVATION_STATUS_COLORS] || '#1677ff';

            return {
                id: reservation.reservation_id.toString(),
                title: `${reservation.USERS.name} (${reservation.DESIGNERS.USERS.name})`,
                start: reservation.start_time,
                end: reservation.end_time,
                backgroundColor: statusColor,
                borderColor: statusColor,
                extendedProps: {
                    status: reservation.status,
                    phone: reservation.USERS.phone
                }
            };
        });
    }, [reservations]);

    // 이전 날짜로 이동
    const handlePrev = () => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.prev();
            setCurrentDate(calendarApi.getDate());
        }
    };

    // 다음 날짜로 이동
    const handleNext = () => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.next();
            setCurrentDate(calendarApi.getDate());
        }
    };

    // 오늘 날짜로 이동
    const handleToday = () => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.today();
            setCurrentDate(calendarApi.getDate());
        }
    };

    // 뷰 변경 (일일/주간)
    const handleViewChange = (value: string) => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.changeView(value);
            setViewType(value);
        }
    };

    return (
        <Content>
            <Flex vertical gap="large" style={{ height: '100%' }}>
                {/* Header Section: Date Navigation & New Reservation Button */}
                <div style={{
                    padding: 16,
                    background: colorBgContainer,
                    borderRadius: borderRadiusLG,
                    display: 'flex',
                    justifyContent: 'space-between', // 네비게이터는 중앙, 버튼은 우측 등 배치를 위해
                    alignItems: 'center',
                    position: 'relative' // 네비게이터 중앙 정렬을 위한 꼼수
                }}>
                    {/* 좌측 뷰 스위처 (일일/주간) */}
                    <div style={{ width: 140 }}>
                        <Segmented
                            options={[
                                { label: STRINGS.SCHEDULE.CALENDAR.VIEW_DAY, value: 'timeGridDay' },
                                { label: STRINGS.SCHEDULE.CALENDAR.VIEW_WEEK, value: 'timeGridWeek' },
                            ]}
                            value={viewType}
                            onChange={handleViewChange}
                        />
                    </div>

                    {/* 중앙 네비게이터 */}
                    <DateNavigator
                        currentDate={currentDate}
                        onPrev={handlePrev}
                        onNext={handleNext}
                        onToday={handleToday}
                    />

                    {/* 우측 새 예약 버튼 (F-SCH-003 미리보기) */}
                    <div style={{ width: 100, textAlign: 'right' }}>
                        <Button type="primary" icon={<PlusOutlined />}>
                            {STRINGS.SCHEDULE.NEW_RESERVATION}
                        </Button>
                    </div>
                </div>

                {/* Body Section: FullCalendar */}
                <div style={{
                    padding: 24,
                    background: colorBgContainer,
                    borderRadius: borderRadiusLG,
                    flex: 1, // 남은 공간 채우기
                    overflow: 'hidden'
                }}>
                    <MainCalendar
                        ref={calendarRef}
                        initialDate={currentDate}
                        events={events}
                    />
                </div>
            </Flex>
        </Content>
    );
};

export default SchedulePage;
