import { UserInfoProps } from "@/types";

export const UserInfo: React.FC<UserInfoProps> = ({ userData, error }) => (
  <div className="flex flex-col text-nowrap">
    {error ? (
      <p className="text-white font-bold">Error: {error}</p>
    ) : userData ? (
      <p className="text-white font-bold capitalize">
        {userData.firstName} {userData.lastName}
      </p>
    ) : (
      <p className="text-white font-bold">Usuario no encontrado</p>
    )}
  </div>
);
