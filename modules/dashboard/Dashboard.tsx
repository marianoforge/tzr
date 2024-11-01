import EventsList from '@/modules/events/EventsList';

import { UserInfo } from '@/components/PrivateComponente/NavComponents/UserInfo';
import { UserAvatar } from '@/components/PrivateComponente/NavComponents/UserAvatar';

import Bubbles from './Bubbles';
import CuadroPrincipal from './CuadroPrincipal';
import CuadroPrincipalChart from './CuadroPrincipalChart';
import MonthlyBarChart from './MonthlyBarChart';
import MonthlyBarChartGross from './MonthlyBarChartGross';
import ObjectiveChart from './ObjectiveChart';
import Profitability from './Profitability';
import MonthlyLineChartPoints from './MonthlyLineChartPoints';

const DashBoard = () => {
  return (
    <>
      <div className="flex flex-row justify-between items-center">
        <div className="text-[28px] font-bold hidden h-[64px] xl:flex md:flex-col justify-center pl-4 w-1/2">
          Dashboard Principal
        </div>
        <div className="hidden xl:flex flex-row justify-end items-center gap-2 w-1/2 mr-2">
          <UserAvatar />
          <UserInfo />
        </div>
      </div>
      <div className="grid grid-cols-1 mt-28 sm:mt-20 xl:mt-2 md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-10 lg:gap-6 mb-6">
        <div className="md:col-span-1 lg:col-span-1 2xl:col-span-4">
          <Bubbles />
        </div>
        <div className="md:col-span-1 mt-8 lg:mt-0 lg:col-span-1 2xl:col-span-3 space-y-8">
          <ObjectiveChart />
          <Profitability />
        </div>
        <div className="md:col-span-1 mt-10 lg:mt-6 lg:col-span-2 2xl:col-span-3 2xl:mt-0">
          <EventsList />
        </div>
      </div>
      <div className="space-y-6">
        <div className="hidden lg:block space-y-8">
          {/* <OperationsTable /> */}
          <MonthlyLineChartPoints />
          {/* <OperationsTableRent /> */}
        </div>
        {/* <div className="block lg:hidden">
          <OperationsCarousel />
        </div> */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 md:gap-10"
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
