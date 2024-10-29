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
    label={view === 'day' ? 'Día' : view === 'week' ? 'Semana' : 'Mes'}
    isActive={currentView === view}
    type="button"
  />
);
