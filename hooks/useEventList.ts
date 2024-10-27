import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Event } from '@/types';
import { useCalendarEvents } from './useCalendarEvents';

export const useEventList = () => {
  const { calendarEvents, isLoading, eventsError } = useCalendarEvents();
  const router = useRouter();

  // Filtrar los primeros 3 eventos
  const displayedEvents = useMemo(
    () => calendarEvents.slice(0, 3),
    [calendarEvents]
  );

  // Función para navegar al calendario
  const handleViewCalendar = useCallback(() => {
    router.push('/calendar');
  }, [router]);

  return {
    displayedEvents,
    isLoading,
    eventsError,
    handleViewCalendar,
  };
};
