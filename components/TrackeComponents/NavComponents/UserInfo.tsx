import { UserInfoProps } from "@/types";

export const UserInfo: React.FC<UserInfoProps> = ({ userData, error }) => (
  <div className="flex flex-col text-nowrap">
    {error ? (
      <p className="font-bold">Error: {error}</p>
    ) : userData ? (
      <p className="font-bold capitalize flex flex-col">
        <span>
          {userData.firstName} {userData.lastName}
        </span>
        <span className="text-xs lowercase  font-normal">{userData.email}</span>
      </p>
    ) : (
      <p className=" font-bold">Usuario no encontrado</p>
    )}
  </div>
);
