import { useCallback, useState } from 'react';

export const useDateNavigation = () => {
  const [date, setDate] = useState(new Date());

  const adjustDate = (date: Date, days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  };

  const navigateCalendar = useCallback(
    (action: 'PREV' | 'NEXT' | 'TODAY', view: 'day' | 'week' | 'month') => {
      const daysToAdjust = view === 'day' ? 1 : view === 'week' ? 7 : 30;
      switch (action) {
        case 'PREV':
          setDate((prevDate) => adjustDate(prevDate, -daysToAdjust));
          break;
        case 'NEXT':
          setDate((prevDate) => adjustDate(prevDate, daysToAdjust));
          break;
        case 'TODAY':
          setDate(new Date());
          break;
      }
    },
    []
  );

  return { date, setDate, navigateCalendar };
};
