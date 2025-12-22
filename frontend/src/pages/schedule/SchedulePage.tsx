import React, { useState, useRef, useMemo } from 'react';
import { Layout, theme, Flex, Button, Segmented, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import DateNavigator from '../../components/schedule/DateNavigator';
import { RESERVATION_STATUS_COLORS } from '../../constants/strings';
import { COLORS } from '../../constants/colors';
import { useReservations } from '../../hooks/useReservations';
import { getDesigners } from '../../api/designer';
import NewReservationModal from '../../components/schedule/NewReservationModal';
import ReservationDetailModal from '../../components/schedule/ReservationDetailModal';
import { CreateReservationDTO } from '../../types/reservation';
import { getShop, ShopDTO } from '../../api/shops';
import { EventClickArg } from '@fullcalendar/core';
import { DateClickArg } from '@fullcalendar/interaction';
import styled from 'styled-components';

const { Content } = Layout;

// ... (Styles remain same)

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
    // ... (Refs and State remain same)
    const calendarRef = useRef<FullCalendar>(null);
    const { shopId } = useParams<{ shopId: string }>();
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [viewType, setViewType] = useState<'timeGridWeek' | 'timeGridDay' | 'dayGridMonth'>('timeGridWeek');
    const [activeDesignerId, setActiveDesignerId] = useState<string>('all');
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false); // Renamed from isModalOpen to match original
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // Renamed from detailModalOpen to match original
    const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
    const [designers, setDesigners] = useState<any[]>([]);
    const [modalInitialData, setModalInitialData] = useState<{ date?: dayjs.Dayjs, designerId?: string } | null>(null); // Type kept from original
    const [shopInfo, setShopInfo] = useState<ShopDTO | null>(null);

    React.useEffect(() => {
        if (!shopId) return;
        const fetchData = async () => {
            try {
                // Fetch Shop Info
                const shop = await getShop(Number(shopId));
                setShopInfo(shop);

                // Fetch Designers
                const data = await getDesigners(Number(shopId));
                setDesigners([
                    { id: 'all', title: '전체 보기', data: null }, // Option for 'All'
                    ...data.map(d => ({
                        id: d.designer_id.toString(), // Ensure ID is string for Tabs
                        title: d.USERS.name,
                        data: d
                    }))
                ]);
            } catch (e) {
                console.error(e);
            }
        };
        fetchData();
    }, [shopId]);

    const handleEventClick = (info: EventClickArg) => {
        const reservationId = info.event.id;
        setSelectedReservationId(reservationId);
        setIsDetailModalOpen(true);
    };

    // NEW: Handle Empty Slot Click
    const handleDateClick = (arg: DateClickArg) => {
        // arg.date is a JS Date object
        console.log('Date Clicked:', arg.date);

        setModalInitialData({
            date: dayjs(arg.date),
            designerId: activeDesignerId // Pass current tab's designer (or 'all')
        });
        setIsReservationModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedReservationId(null);
    };

    const handleUpdateReservation = () => {
        refetch();
    };

    // ... (Theme token, queryParams, refetch remain same - no changes needed there)
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

    const { data: reservations, refetch } = useReservations(shopId ? Number(shopId) : null, queryParams);

    // ... (Helper functions remain same)
    const dayToJsonInt = (dayStr: string) => {
        const map: { [key: string]: number } = {
            'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6,
            'SUN': 0, 'MON': 1, 'TUE': 2, 'WED': 3, 'THU': 4, 'FRI': 5, 'SAT': 6
        };
        return map[dayStr] ?? -1;
    };

    // ... (Event filtering remains same)
    const events = useMemo(() => {
        let allEvents: any[] = [];

        // 1. Reservation Events
        if (reservations) {
            let filtered = reservations;
            if (activeDesignerId !== 'all') {
                filtered = reservations.filter(r => r.designer_id.toString() === activeDesignerId);
            }
            const resEvents = filtered.map(reservation => {
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
                        phone: reservation.USERS.phone,
                        menu: reservation.RESERVATION_ITEMS?.[0]?.menu_name || '',
                        memo: reservation.request_memo || ''
                    }
                };
            });
            allEvents = [...allEvents, ...resEvents];
        }

        // 2. Background Events (Shop Closed) - Always shown
        if (shopInfo?.closed_days) {
            const closedDays = shopInfo.closed_days.split(',').map(d => dayToJsonInt(d.trim())).filter(d => d !== -1);
            if (closedDays.length > 0) {
                allEvents.push({
                    daysOfWeek: closedDays,
                    display: 'background',
                    color: COLORS.CALENDAR.UNAVAILABLE,
                    // Removed allDay: true because allDaySlot is hidden
                    title: '휴무'
                });
            }
        }

        // 3. Designer Availability (Lunch / Day Off) - Only if specific designer selected
        if (activeDesignerId !== 'all') {
            const currentDesigner = designers.find(d => d.id === activeDesignerId);
            if (currentDesigner && currentDesigner.data) {
                const dData = currentDesigner.data; // Raw DesignerDTO

                // Day Off
                if (dData.day_off) {
                    const daysOff = dData.day_off.split(',').map((d: string) => dayToJsonInt(d.trim())).filter((d: number) => d !== -1);
                    if (daysOff.length > 0) {
                        allEvents.push({
                            daysOfWeek: daysOff,
                            display: 'background',
                            color: COLORS.CALENDAR.UNAVAILABLE,
                            // Removed allDay: true
                            title: '휴무'
                        });
                    }
                }

                // Lunch Time
                if (dData.lunch_start && dData.lunch_end) {
                    allEvents.push({
                        daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Every day recurrence
                        startTime: dData.lunch_start, // HH:mm
                        endTime: dData.lunch_end,
                        display: 'background',
                        color: COLORS.CALENDAR.UNAVAILABLE,
                        title: '점심시간',
                    });
                }
            }
        }

        return allEvents;
    }, [reservations, activeDesignerId, shopInfo, designers]);

    // ... (Navigation Handlers remain same)
    const handleDateSelect = (date: Date) => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.gotoDate(date);
            setCurrentDate(dayjs(date));
        }
    };

    const handlePrev = () => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.prev();
            setCurrentDate(dayjs(calendarApi.getDate()));
        }
    };
    const handleNext = () => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.next();
            setCurrentDate(dayjs(calendarApi.getDate()));
        }
    };
    const handleToday = () => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.today();
            setCurrentDate(dayjs(calendarApi.getDate()));
        }
    };
    const handleViewChange = (value: string) => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.changeView(value);
            setViewType(value as 'timeGridWeek' | 'timeGridDay' | 'dayGridMonth');
        }
    };

    const handleOpenModal = () => {
        setModalInitialData(null); // Reset if opening via button
        setIsReservationModalOpen(true);
    };
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
                        currentDate={currentDate.toDate()}
                        onPrev={handlePrev}
                        onNext={handleNext}
                        onToday={handleToday}
                        onDateSelect={handleDateSelect}
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
                            initialView="timeGridWeek" // Changed initial view
                            initialDate={currentDate.toDate()}
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
                            dateClick={handleDateClick}
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
                initialData={modalInitialData}
                shopId={shopId ? Number(shopId) : null}
            />

            <ReservationDetailModal
                isOpen={isDetailModalOpen}
                reservationId={selectedReservationId}
                onClose={handleCloseDetailModal}
                onUpdate={handleUpdateReservation}
                shopId={shopId ? Number(shopId) : null}
            />
        </Content>
    );
};

export default SchedulePage;
