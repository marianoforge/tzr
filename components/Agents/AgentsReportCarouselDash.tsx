import React from "react";

import AgentsReportCarousel from "./AgentsReportCarousel";
import { UserData } from "@/types";

const AgentsReportCarouselDash = ({
  currentUser,
}: {
  currentUser: UserData;
}) => {
  return (
    <div className="bg-white p-6 mt-6 rounded-lg shadow-md pb-10">
      <h2 className="text-2xl font-bold mb-2 text-center">Reporte Agentes</h2>
      <AgentsReportCarousel currentUser={currentUser} />
    </div>
  );
};

export default AgentsReportCarouselDash;
