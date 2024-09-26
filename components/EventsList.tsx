import React, { useState, useEffect } from "react";
import { useOperationsStore } from "@/stores/operationsStore";
import Loader from "./Loader";

interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
}

interface EventsListProps {
  userId: string;
}

const EventsList: React.FC<EventsListProps> = ({ userId }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const { isLoading } = useOperationsStore();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/eventsPerUser?user_uid=${userId}`);
        if (!response.ok) {
          throw new Error("Error al obtener eventos");
        }
        const fetchedEvents: Event[] = await response.json();
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Error al obtener eventos:", error);
      }
    };

    fetchEvents();
  }, [userId]);

  if (isLoading) {
    return <Loader />;
  }

  const displayedEvents = events.slice(0, 3);

  return (
    <div className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow-md  items-center justify-center min-h-[450px]">
      {displayedEvents.length === 0 ? (
        <p className="text-center text-gray-500">No hay eventos programados.</p>
      ) : (
        displayedEvents.map((event) => (
          <div
            className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-[#D98B84] even:border-t-[#5FAAD7] w-full"
            key={event.id}
          >
            <div className="flex items-center justify-between">
              <h1 className="font-semibold text-gray-600">{event.title}</h1>
              <span className="text-gray-400 text-xs">
                {event.date} | {event.startTime} - {event.endTime}
              </span>
            </div>
            <p className="mt-2 text-gray-400 text-sm">{event.description}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default EventsList;
