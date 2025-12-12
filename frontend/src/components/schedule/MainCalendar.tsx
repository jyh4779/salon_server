import { forwardRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';
import { EventInput } from '@fullcalendar/core';
import styled from 'styled-components';

// 스타일드 컴포넌트를 사용하여 캘린더 커스터마이징 (필요 시)
const CalendarWrapper = styled.div`
  .fc {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }
  .fc-timegrid-slot {
    height: 3em; 
  }
`;

interface MainCalendarProps {
  initialDate?: Date;
  events?: EventInput[]; // Strict typing using FullCalendar's EventInput
}

/**
 * MainCalendar
 * 
 * @description
 * FullCalendar 라이브러리를 사용한 메인 캘린더 컴포넌트입니다.
 * 부모 컴포넌트에서 ref를 통해 API를 제어할 수 있습니다.
 */
const MainCalendar = forwardRef<FullCalendar, MainCalendarProps>(({ initialDate, events }, ref) => {
  return (
    <CalendarWrapper>
      <FullCalendar
        ref={ref}
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
        initialView="timeGridDay"
        initialDate={initialDate}
        locale={koLocale}
        headerToolbar={false} // 상단 툴바는 DateNavigator에서 별도 제어하므로 숨김
        slotMinTime="09:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        nowIndicator={true}
        height="auto"
        events={events}
      />
    </CalendarWrapper>
  );
});

export default MainCalendar;
