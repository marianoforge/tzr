import CuadroPrincipal from "@/components/CuadroPrincipal/CuadroPrincipal";
import CuadroPrincipalChart from "@/components/CuadroPrincipal/CuadroPrincipalChart";
import Bubbles from "@/components/Bubbles";
import EventsList from "@/components/Events/EventsList";
import MonthlyMockedBarchart from "@/components/MonthlyBarChart/MonthlyMockedBarchart";
import ObjectiveChart from "./ObjectiveChart";
import OperationsListDash from "./Operations/OperationsListDash";
import OperationsCarouselDash from "./Operations/OperationsCarouselDash"; // Import the new component
import Profitability from "./Profitability";
import { UserInfo } from "./NavComponents/UserInfo";
import { useUserDataStore } from "@/stores/userDataStore";
import { UserAvatar } from "./NavComponents/UserAvatar";

const DashBoard = () => {
  const { userData, error } = useUserDataStore();
  return (
    <>
      <div className="flex flex-row justify-between items-center">
        <div className="text-[28px] font-bold hidden h-[64px] xl:flex md:flex-col justify-center pl-4 w-1/2">
          Dashboard Principal
        </div>
        <div className="hidden xl:flex flex-row justify-end items-center gap-2 w-1/2">
          <UserAvatar />
          <UserInfo userData={userData} error={error} />
        </div>
      </div>
      <div className="grid grid-cols-1 mt-16 sm:mt-14 md:mt-12 lg:mt-12 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-10 gap-4 lg:gap-6 mb-6">
        <div className="md:col-span-2 lg:col-span-1 2xl:col-span-4">
          <Bubbles />
        </div>
        <div className="md:col-span-2 lg:col-span-1 2xl:col-span-3 space-y-4">
          <ObjectiveChart />
          <Profitability />
        </div>
        <div className="md:col-span-2 lg:col-span-2 2xl:col-span-3">
          <EventsList />
        </div>
      </div>
      <div className="space-y-6">
        <div className="hidden lg:block">
          <OperationsListDash />
        </div>
        <div className="block lg:hidden">
          <OperationsCarouselDash filter="all" setFilter={() => {}} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-6">
          <CuadroPrincipal />
          <CuadroPrincipalChart />
        </div>
        {/* Sacar el Mocked */}
        <MonthlyMockedBarchart />
      </div>
    </>
  );
};

export default DashBoard;
