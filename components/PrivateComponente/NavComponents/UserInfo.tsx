import { useEffect, useState } from 'react';

import { useAuthStore } from '@/stores/authStore';
import { UserInfoProps } from '@/common/types/';

export const UserInfo = () => {
  const [userData, setUserData] = useState<UserInfoProps | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { userID } = useAuthStore();
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/users/${userID}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setUserData(data);
        setIsLoading(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    };

    fetchUserData();
  }, [userID]);

  return (
    <div className="flex flex-col text-nowrap">
      {isLoading ? (
        <p className="font-bold">Loading...</p>
      ) : error ? (
        <p className="font-bold">Error: {error}</p>
      ) : userData ? (
        <p className="font-bold capitalize flex flex-col">
          <span>
            {userData.firstName} {userData.lastName}
          </span>
          <span className="text-xs lowercase font-normal">
            {userData.email}
          </span>
        </p>
      ) : (
        <p className="font-bold">Usuario no encontrado</p>
      )}
    </div>
  );
};
