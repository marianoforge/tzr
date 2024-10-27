import { useEffect, useState } from 'react';
import { View, Views } from 'react-big-calendar';

export const useCalendarResponsiveView = () => {
  const [view, setView] = useState<View>(Views.MONTH);

  useEffect(() => {
    const updateView = () => {
      if (window.innerWidth < 640) {
        setView(Views.DAY);
      } else if (window.innerWidth < 768) {
        setView(Views.WEEK);
      } else {
        setView(Views.MONTH);
      }
    };

    updateView();
    window.addEventListener('resize', updateView);

    return () => window.removeEventListener('resize', updateView);
  }, []);

  return { view, setView };
};
