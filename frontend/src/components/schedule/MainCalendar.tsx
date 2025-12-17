import { forwardRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
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
  events?: EventInput[];
  resources?: any[]; // Resource Input
  eventContent?: (arg: any) => JSX.Element;
}

const MainCalendar = forwardRef<FullCalendar, MainCalendarProps>(({ initialDate, events, resources, eventContent }, ref) => {
  return (
    <CalendarWrapper>
      <FullCalendar
        ref={ref}
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin, resourceTimeGridPlugin]}
        initialView="resourceTimeGridDay"
        initialDate={initialDate}
        locale={koLocale}
        headerToolbar={false}
        slotMinTime="09:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        nowIndicator={true}
        height="auto"
        resources={resources}
        events={events}
        eventContent={eventContent}
        resourceAreaWidth="0px" // Hide resource column if not needed or adjust
        // resourceAreaHeaderContent="디자이너"
        datesAboveResources={true} // 날짜 아래에 리소스 표시 (일반적인 컬럼 뷰)
        slotEventOverlap={false} // 겹치는 이벤트를 겹치지 않고 나란히 표시 (너비 분할)
      />
    </CalendarWrapper>
  );
});

export default MainCalendar;
