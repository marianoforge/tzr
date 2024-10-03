import React, { useEffect } from "react";
import { useOperationsStore } from "@/stores/useOperationsStore";
import Loader from "../Loader";
import { useAuthStore } from "@/stores/authStore";
import { useEventsStore } from "@/stores/useEventsStore";
import router from "next/router";

const EventsList: React.FC = () => {
  const { userID } = useAuthStore();
  const { isLoading } = useOperationsStore();
  const { events, error, fetchEvents } = useEventsStore();

  useEffect(() => {
    if (userID) {
      fetchEvents(userID);
    }
  }, [userID, fetchEvents]);

  if (error) {
    return (
      <p className="text-center text-red-500">
        Error al obtener eventos: {error}
      </p>
    );
  }

  const displayedEvents = events.slice(0, 3);

  return isLoading ? (
    <Loader />
  ) : (
    <div className="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-md items-center justify-center lg:text-sm lg:max-h-[450px] min-h-[450px] min-w-[340px]">
      {displayedEvents.length === 0 ? (
        <p className="text-center text-gray-500">No hay eventos programados.</p>
      ) : (
        displayedEvents.map((event) => (
          <div
            className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-lightBlue even:border-t-darkBlue w-full min-w-[340px]"
            key={event.id}
          >
            <div className="flex items-center justify-between">
              <h1 className="font-semibold text-gray-600">{event.title}</h1>
              <span className="text-gray-400 text-xs">
                {event.date} | {event.startTime} - {event.endTime}
              </span>
            </div>
            <p className="mt-2 text-gray-400 text-sm">
              {event.description.length > 49 && window.innerWidth < 1024
                ? `${event.description.substring(0, 49)} [...]`
                : event.description}
            </p>
          </div>
        ))
      )}
      <button
        className="bg-darkBlue text-white p-2 rounded-md font-semibold"
        onClick={() => {
          router.push("/calendar");
        }}
      >
        Ver calendario de eventos
      </button>
    </div>
  );
};

export default EventsList;
