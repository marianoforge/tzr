import { CalendarView } from '@/common/enums';
import Button from '@/components/PrivateComponente/FormComponents/Button';
import { View } from 'react-big-calendar';

export const ViewButton = ({
  view,
  currentView,
  onClick,
}: {
  view: View;
  currentView: View;
  onClick: () => void;
}) => (
  <Button
    onClick={onClick}
    label={
      view === CalendarView.DAY
        ? 'Día'
        : view === CalendarView.WEEK
          ? 'Semana'
          : 'Mes'
    }
    isActive={currentView === view}
    type="button"
  />
);