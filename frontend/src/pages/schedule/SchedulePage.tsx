import React, { useState, useRef, useMemo } from 'react';
import { Layout, theme, Flex, Button, Segmented } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import FullCalendar from '@fullcalendar/react';
import dayjs from 'dayjs';
import DateNavigator from '../../components/schedule/DateNavigator';
import MainCalendar from '../../components/schedule/MainCalendar';
import { STRINGS, RESERVATION_STATUS_COLORS } from '../../constants/strings';
import { useReservations } from '../../hooks/useReservations';
import NewReservationModal from '../../components/schedule/NewReservationModal';
import { CreateReservationDTO } from '../../types/reservation';

const { Content } = Layout;

const SchedulePage: React.FC = () => {
    // Calendar Ref를 통해 API에 접근 (prev, next 등)
    const calendarRef = useRef<FullCalendar>(null);

    // 현재 보고 있는 날짜 상태
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [viewType, setViewType] = useState<string>('resourceTimeGridDay');

    // 디자이너 리소스 상태
    const [designers, setDesigners] = useState<any[]>([]);

    React.useEffect(() => {
        const fetchDesigners = async () => {
            try {
                const { getDesigners } = await import('../../api/designer');
                const data = await getDesigners();
                setDesigners(data.map(d => ({
                    id: d.designer_id.toString(),
                    title: d.USERS.name
                })));
            } catch (error) {
                console.error('Failed to load designers:', error);
            }
        };
        fetchDesigners();
    }, []);

    // 새 예약 모달 상태
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

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
    const { data: reservations, refetch } = useReservations(queryParams);

    // FullCalendar Event 변환
    const events = useMemo(() => {
        if (!reservations) return [];
        return reservations.map(reservation => {
            const statusColor = RESERVATION_STATUS_COLORS[reservation.status as keyof typeof RESERVATION_STATUS_COLORS] || '#1677ff';

            return {
                id: reservation.reservation_id.toString(),
                resourceId: reservation.designer_id.toString(),
                title: viewType === 'resourceTimeGridDay'
                    ? `${reservation.USERS.name}`
                    : `${reservation.USERS.name} (${reservation.DESIGNERS.USERS.name})`,
                start: reservation.start_time,
                end: reservation.end_time,
                backgroundColor: statusColor,
                borderColor: statusColor,
                extendedProps: {
                    status: reservation.status,
                    phone: reservation.USERS.phone,
                    menu: reservation.RESERVATION_ITEMS?.[0]?.menu_name || '',
                    memo: reservation.request_memo || ''
                }
            };
        });
    }, [reservations, viewType]);

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

    // 새 예약 모달 핸들러
    const handleOpenModal = () => setIsReservationModalOpen(true);
    const handleCloseModal = () => setIsReservationModalOpen(false);

    // 예약 생성 핸들러
    const handleCreateReservation = (data: CreateReservationDTO) => {
        console.log('New Reservation Created, refreshing list...');
        refetch();
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
                                { label: STRINGS.SCHEDULE.CALENDAR.VIEW_DAY, value: 'resourceTimeGridDay' },
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
                        viewType={viewType}
                    />

                    {/* 우측 새 예약 버튼 (F-SCH-003 미리보기) */}
                    <div style={{ width: 100, textAlign: 'right' }}>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenModal}>
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
                        resources={designers}
                        events={events}
                        eventContent={(eventInfo) => {
                            const { title, extendedProps } = eventInfo.event;
                            return (
                                <div style={{ padding: '2px 4px', overflow: 'hidden' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{title}</div>
                                    {extendedProps.menu && (
                                        <div style={{ fontSize: '12px', marginTop: '2px' }}>✂ {extendedProps.menu}</div>
                                    )}
                                    {extendedProps.memo && (
                                        <div style={{ fontSize: '11px', color: '#fff', opacity: 0.9, marginTop: '2px' }}>
                                            📝 {extendedProps.memo}
                                        </div>
                                    )}
                                </div>
                            );
                        }}
                    />
                </div>
            </Flex>

            <NewReservationModal
                isOpen={isReservationModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleCreateReservation}
            />
        </Content>
    );
};

export default SchedulePage;
