import React, { useState, useRef, useMemo } from 'react';
import { Layout, theme, Flex, Button, Segmented, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';
import dayjs from 'dayjs';
import DateNavigator from '../../components/schedule/DateNavigator';
import { STRINGS, RESERVATION_STATUS_COLORS } from '../../constants/strings';
import { useReservations } from '../../hooks/useReservations';
import NewReservationModal from '../../components/schedule/NewReservationModal';
import ReservationDetailModal from '../../components/schedule/ReservationDetailModal';
import { CreateReservationDTO } from '../../types/reservation';
import { getShop, ShopDTO } from '../../api/shops';
import { EventClickArg } from '@fullcalendar/core';
import styled from 'styled-components';

const { Content } = Layout;

const CalendarWrapper = styled.div`
  .fc {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }
  /* Increase slot height */
  .fc-timegrid-slot {
    height: 3.5em !important; 
  }
`;

const SchedulePage: React.FC = () => {
    const calendarRef = useRef<FullCalendar>(null);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [viewType, setViewType] = useState<string>('timeGridDay'); // Standard View
    const [activeDesignerId, setActiveDesignerId] = useState<string>('all');

    // Designers State (Simulated/Fetched) - For Tabs
    const [designers, setDesigners] = useState<any[]>([]);
    const [shopInfo, setShopInfo] = useState<ShopDTO | null>(null);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Shop Info (Default 1 for now)
                const shop = await getShop(1);
                setShopInfo(shop);

                // Fetch Designers
                const { getDesigners } = await import('../../api/designer');
                const data = await getDesigners();
                setDesigners([
                    { id: 'all', title: '전체 보기' }, // Option for 'All'
                    ...data.map(d => ({
                        id: d.designer_id.toString(),
                        title: d.USERS.name
                    }))
                ]);
            } catch (error) {
                console.error('Failed to load initial data:', error);
            }
        };
        fetchData();
    }, []);

    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);

    const handleEventClick = (info: EventClickArg) => {
        const reservationId = info.event.id;
        setSelectedReservationId(reservationId);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedReservationId(null);
    };

    const handleUpdateReservation = () => {
        refetch();
    };

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

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

    const { data: reservations, refetch } = useReservations(queryParams);

    // Filter Events by Tab
    const events = useMemo(() => {
        if (!reservations) return [];

        // 1. Filter by Designer
        let filtered = reservations;
        if (activeDesignerId !== 'all') {
            filtered = reservations.filter(r => r.designer_id.toString() === activeDesignerId);
        }

        return filtered.map(reservation => {
            const statusColor = RESERVATION_STATUS_COLORS[reservation.status as keyof typeof RESERVATION_STATUS_COLORS] || '#1677ff';

            return {
                id: reservation.reservation_id.toString(),
                // resourceId: removed (not using resource view)
                title: `${reservation.USERS.name} (${reservation.DESIGNERS.USERS.name})`,
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
    }, [reservations, activeDesignerId]);

    // Navigation Handlers
    const handlePrev = () => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.prev();
            setCurrentDate(calendarApi.getDate());
        }
    };
    const handleNext = () => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.next();
            setCurrentDate(calendarApi.getDate());
        }
    };
    const handleToday = () => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.today();
            setCurrentDate(calendarApi.getDate());
        }
    };
    const handleViewChange = (value: string) => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.changeView(value);
            setViewType(value);
        }
    };

    const handleOpenModal = () => setIsReservationModalOpen(true);
    const handleCloseModal = () => setIsReservationModalOpen(false);
    const handleCreateReservation = (_data: CreateReservationDTO) => {
        refetch();
    };

    return (
        <Content>
            <Flex vertical gap="small" style={{ height: '100%' }}>
                {/* 1. Designer Tabs - KEY difference */}
                <div style={{ background: colorBgContainer, padding: '0 16px', borderRadius: borderRadiusLG }}>
                    <Tabs
                        activeKey={activeDesignerId}
                        onChange={setActiveDesignerId}
                        items={designers.map(d => ({
                            key: d.id,
                            label: d.title,
                        }))}
                    />
                </div>

                {/* 2. Header */}
                <div style={{
                    padding: 16,
                    background: colorBgContainer,
                    borderRadius: borderRadiusLG,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <div style={{ width: 140 }}>
                        <Segmented
                            options={[
                                { label: '일간', value: 'timeGridDay' }, // Free Standard View
                                { label: '주간', value: 'timeGridWeek' },
                            ]}
                            value={viewType}
                            onChange={handleViewChange}
                        />
                    </div>

                    <DateNavigator
                        currentDate={currentDate}
                        onPrev={handlePrev}
                        onNext={handleNext}
                        onToday={handleToday}
                        viewType={viewType}
                    />

                    <div style={{ width: 100, textAlign: 'right' }}>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenModal}>
                            새 예약
                        </Button>
                    </div>
                </div>

                {/* 3. Calendar Body - Standard View */}
                <div style={{
                    padding: 24,
                    background: colorBgContainer,
                    borderRadius: borderRadiusLG,
                    flex: 1,
                    overflow: 'hidden'
                }}>
                    <CalendarWrapper>
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]} // No resource plugin
                            initialView="timeGridDay"
                            initialDate={currentDate}
                            locale={koLocale}
                            headerToolbar={false}
                            slotMinTime={shopInfo?.open_time ? `${shopInfo.open_time}:00` : "10:00:00"}
                            slotMaxTime={shopInfo?.close_time ? `${shopInfo.close_time}:00` : "20:00:00"}
                            allDaySlot={false}
                            slotEventOverlap={false}
                            nowIndicator={true}
                            height="auto"
                            events={events} // Filtered events only
                            eventClick={handleEventClick}
                            eventContent={(eventInfo) => {
                                const { title, extendedProps } = eventInfo.event;
                                return (
                                    <div style={{ padding: '2px 4px', overflow: 'hidden' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{title}</div>
                                        {extendedProps.menu && (
                                            <div style={{ fontSize: '12px', marginTop: '2px' }}>✂ {extendedProps.menu}</div>
                                        )}
                                    </div>
                                );
                            }}
                        />
                    </CalendarWrapper>
                </div>
            </Flex>

            <NewReservationModal
                isOpen={isReservationModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleCreateReservation}
            />

            <ReservationDetailModal
                isOpen={isDetailModalOpen}
                reservationId={selectedReservationId}
                onClose={handleCloseDetailModal}
                onUpdate={handleUpdateReservation}
            />
        </Content>
    );
};

export default SchedulePage;
