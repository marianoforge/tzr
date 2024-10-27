import { View } from 'react-big-calendar';
import Button from '../FormComponents/Button';

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
    label={view === 'day' ? 'Día' : view === 'week' ? 'Semana' : 'Mes'}
    isActive={currentView === view}
    type="button"
  />
);
