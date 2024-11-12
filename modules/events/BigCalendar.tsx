import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import React, { useState } from 'react';

import EventModal from './EventModal';
import { ViewButton } from './ViewButton';

import { useCalendarEvents } from '@/common/hooks/useCalendarEvents';
import { useDateNavigation } from '@/common/hooks/useDateNavigation';
import { useCalendarResponsiveView } from '@/common/hooks/useCalendarResponsiveView';
import { Event } from '@/common/types/';
import { NavButton } from '@/components/PrivateComponente/NavComponents/NavButton';
import SkeletonLoader from '@/components/PrivateComponente/CommonComponents/SkeletonLoader';
import { CalendarView, CalendarAction } from '@/common/enums';

const localizer = momentLocalizer(moment);

const BigCalendar = () => {
  const { calendarEvents, isLoading, eventsError } = useCalendarEvents();
  const { date, setDate, navigateCalendar } = useDateNavigation();
  const { view, setView } = useCalendarResponsiveView();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  if (isLoading) {
    return (
      <div className="mt-[70px]">
        <SkeletonLoader height={1000} count={1} />
      </div>
    );
  }
  if (eventsError) {
    return <p>Error: {eventsError.message || 'An unknown error occurred'}</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-2 sm:p-4 md:p-6 mb-20">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6">
        <div className="flex space-x-2 sm:space-x-4 mb-2 sm:mb-0">
          <NavButton
            className="text-white bg-mediumBlue hover:bg-lightBlue"
            onClick={() =>
              navigateCalendar(CalendarAction.PREV, view as CalendarView)
            }
            label="<"
          />
          <NavButton
            className="text-white bg-mediumBlue hover:bg-lightBlue"
            onClick={() =>
              navigateCalendar(CalendarAction.TODAY, view as CalendarView)
            }
            label="Hoy"
          />
          <NavButton
            className="text-white bg-mediumBlue hover:bg-lightBlue"
            onClick={() =>
              navigateCalendar(CalendarAction.NEXT, view as CalendarView)
            }
            label=">"
          />
        </div>
        <div className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-0">
          {moment(date).format('dddd, MMMM D, YYYY')}
        </div>
        <div className="flex flex-wrap justify-center sm:justify-end space-x-2">
          {[
            { label: 'Día', value: Views.DAY },
            { label: 'Semana', value: Views.WEEK },
            { label: 'Mes', value: Views.MONTH },
          ].map((viewOption) => (
            <ViewButton
              key={viewOption.value}
              view={viewOption.value}
              currentView={view}
              onClick={() => setView(viewOption.value)}
            />
          ))}
        </div>
      </div>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="startTime"
        endAccessor="endTime"
        views={['day', 'week', 'month']}
        view={view}
        date={date}
        onNavigate={setDate}
        onView={setView}
        min={new Date(new Date().getFullYear(), 0, 1, 8, 0, 0)}
        max={new Date(new Date().getFullYear(), 11, 31, 22, 0, 0)}
        className="rounded-xl overflow-hidden"
        style={{ height: 'calc(100vh - 200px)' }}
        formats={{
          dayFormat: (date, culture, localizer) =>
            localizer?.format(date, 'ddd DD', culture) ?? '',
          eventTimeRangeFormat: () => '',
        }}
        components={{
          event: (props: { event: Event }) => (
            <div
              className="bg-lightBlue text-white p-1 rounded text-xs sm:text-sm"
              onClick={() =>
                handleEventClick({
                  ...props.event,
                  date: props.event.date,
                  startTime: new Date(props.event.startTime).toISOString(),
                  endTime: new Date(props.event.endTime).toISOString(),
                  user_uid: props.event.user_uid,
                  title: props.event.title,
                  description: props.event.description,
                })
              }
            >
              <span>
                {new Date(props.event.startTime).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {' - '}
              {props.event.title}
            </div>
          ),
        }}
      />
      <EventModal
        isOpen={isModalOpen}
        onClose={closeModal}
        event={selectedEvent}
      />
    </div>
  );
};

export default BigCalendar;
