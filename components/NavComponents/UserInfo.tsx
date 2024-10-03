import { UserInfoProps } from "@/types";

export const UserInfo: React.FC<UserInfoProps> = ({ userData, error }) => (
  <div className="flex flex-col text-nowrap">
    {error ? (
      <p className=" font-bold">Error: {error}</p>
    ) : userData ? (
      <p className="font-bold capitalize">
        {userData.firstName} {userData.lastName}
      </p>
    ) : (
      <p className=" font-bold">Usuario no encontrado</p>
    )}
  </div>
);
