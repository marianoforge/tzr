import { useUserDataStore } from '@/stores/userDataStore';

export const UserAvatar = () => {
  const { userData } = useUserDataStore();

  // Función para obtener las iniciales de un nombre completo
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('');
  };
  // Obtener las iniciales de firstName y lastName
  const initials = userData
    ? `${getInitials(userData.firstName || '')}${getInitials(
        userData.lastName || ''
      )}`
    : '';

  return (
    <div className="w-12 font-semibold bg-lightBlue h-12 text-white rounded-full overflow-hidden flex items-center justify-center">
      {initials}
    </div>
  );
};
