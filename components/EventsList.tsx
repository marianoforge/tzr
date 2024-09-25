import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
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

const EventsList = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const { isLoading } = useOperationsStore();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCollection = collection(db, "events");
        const eventsQuery = query(eventsCollection, orderBy("date", "asc"));
        const querySnapshot = await getDocs(eventsQuery);

        const fetchedEvents: Event[] = querySnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Event)
        );

        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-4 bg-white p-6 rounded-lg">
      {events.length === 0 ? (
        <p className="text-center text-gray-500">No hay eventos programados.</p>
      ) : (
        events.map((event) => (
          <div
            className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-[#D98B84] even:border-t-[#5FAAD7]"
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
