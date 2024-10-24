import CuadroPrincipal from '@/components/TrackerComponents/CuadroPrincipal/CuadroPrincipal';
import CuadroPrincipalChart from '@/components/TrackerComponents/CuadroPrincipal/CuadroPrincipalChart';
import Bubbles from '@/components/TrackerComponents/Bubbles';
import EventsList from '@/components/TrackerComponents/Events/EventsList';
import ObjectiveChart from '@/components/TrackerComponents/ObjectiveChart';
import OperationsListDash from '@/components/TrackerComponents/Operations/OperationsListDash';
import Profitability from '@/components/TrackerComponents/Profitability';
import { UserInfo } from '@/components/TrackerComponents/NavComponents/UserInfo';
import { UserAvatar } from '@/components/TrackerComponents/NavComponents/UserAvatar';

import MonthlyBarChart from './MonthlyBarChart/MonthlyBarChart';
import MonthlyBarChartGross from './MonthlyBarChart/MonthlyBarChartGross';

const DashBoard = () => {
  return (
    <>
      <div className="flex flex-row justify-between items-center">
        <div className="text-[28px] font-bold hidden h-[64px] xl:flex md:flex-col justify-center pl-4 w-1/2">
          Dashboard Principal
        </div>
        <div className="hidden xl:flex flex-row justify-end items-center gap-2 w-1/2">
          <UserAvatar />
          <UserInfo />
        </div>
      </div>
      <div className="grid grid-cols-1 mt-32 sm:mt-20 xl:mt-2 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-10 gap-4 lg:gap-6 mb-6">
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
        {/* <div className="block lg:hidden">
          <OperationsCarouselDash filter="all" setFilter={() => {}} />
        </div> */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          style={{ marginTop: '2.5rem' }}
        >
          <div className="col-span-1 lg:col-span-2">
            <CuadroPrincipal />
          </div>
          <div className="col-span-1">
            <CuadroPrincipalChart />
          </div>
        </div>
        {/* Sacar el Mocked */}
        <div style={{ marginTop: '2.5rem' }}>
          <MonthlyBarChart />
          {/* <MonthlyMockedBarchart /> */}
        </div>
        <div style={{ marginTop: '2.5rem' }}>
          <MonthlyBarChartGross />
          {/* <MonthlyMockedBarchart /> */}
        </div>
      </div>
    </>
  );
};

export default DashBoard;
