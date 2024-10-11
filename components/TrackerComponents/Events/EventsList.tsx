import React from "react";
import Loader from "../Loader";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query"; // Importar useQuery
import { fetchUserEvents } from "@/lib/api/eventsApi"; // Asegúrate de tener esta función en tu eventsApi.ts
import router from "next/router";
import { Event } from "@/types";

const EventsList: React.FC = () => {
  const { userID } = useAuthStore();

  // Utilizar Tanstack Query para obtener los eventos
  const {
    data: events = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["events", userID], // Query key única por usuario
    queryFn: () => fetchUserEvents(userID!), // Función para obtener eventos
    enabled: !!userID, // Solo ejecutar la consulta si userID está definido
  });

  // Filtrar los primeros 3 eventos
  const displayedEvents = events.slice(0, 3);

  if (error) {
    return (
      <p className="text-center text-red-500">
        Error al obtener eventos: {(error as Error).message}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-md items-center justify-center lg:max-h-[450px] min-h-[450px] min-w-[340px]">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {displayedEvents.length === 0 ? (
            <p className="text-center text-gray-500">
              No hay eventos programados.
            </p>
          ) : (
            displayedEvents.map((event: Event) => (
              <div
                className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-lightBlue even:border-t-darkBlue w-full min-w-[340px]"
                key={event.id}
              >
                <div className="flex items-center justify-between">
                  <h1 className="font-semibold text-gray-600 text-md md:text-lg lg:text-md xl:text-lg">
                    {event.title}
                  </h1>
                  <span className="text-gray-400 text-md md:text-lg lg:text-lg xl:text-md 2xl:text-sm">
                    {event.date} | {event.startTime} - {event.endTime}
                  </span>
                </div>
                <p className="mt-2 text-gray-400 text-sm">
                  {event.description.length > 49 && window.innerWidth > 1024
                    ? `${event.description.substring(0, 49)} [...]`
                    : event.description.length > 100
                    ? `${event.description.substring(0, 40)} [...]`
                    : event.description}
                </p>
              </div>
            ))
          )}
          <button
            className="bg-darkBlue text-white p-2 rounded-md font-semibold mt-2"
            onClick={() => {
              router.push("/calendar");
            }}
          >
            Ver calendario de eventos
          </button>
        </>
      )}
    </div>
  );
};

export default EventsList;
