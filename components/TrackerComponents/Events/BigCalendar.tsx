"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import EventModal from "./EventModal";
import { Event } from "@/types";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query"; // Import Tanstack Query
import { fetchUserEvents } from "@/lib/api/eventsApi"; // Import fetchUserEvents API function
import SkeletonLoader from "../SkeletonLoader";

const localizer = momentLocalizer(moment);

const BigCalendar = () => {
  const { userID } = useAuthStore();
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date()); // Cambiar a la fecha actual
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch events for the logged-in user
  const {
    data: events = [],
    isLoading,
    error: eventsError,
  } = useQuery({
    queryKey: ["events", userID],
    queryFn: () => fetchUserEvents(userID as string),
    enabled: !!userID, // Only fetch if userID exists
  });

  // Utility function to map events
  const mapEventToCalendarEvent = (event: Event) => ({
    id: event.id,
    title: event.title,
    startTime: new Date(`${event.date}T${event.startTime}`),
    endTime: new Date(`${event.date}T${event.endTime}`),
    description: event.description,
    user_uid: event.user_uid,
  });

  // Memoize the mapped events
  const calendarEvents = useMemo(
    () => events.map(mapEventToCalendarEvent),
    [events]
  );

  // Utility function for date navigation
  const adjustDate = (date: Date, days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  };

  // Memoize the navigation function
  const navigateCalendar = useCallback((action: "PREV" | "NEXT" | "TODAY") => {
    switch (action) {
      case "PREV":
        setDate((prevDate) => adjustDate(prevDate, -7));
        break;
      case "NEXT":
        setDate((prevDate) => adjustDate(prevDate, 7));
        break;
      case "TODAY":
        setDate(new Date());
        break;
    }
  }, []);

  const formatEventTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  useEffect(() => {
    const updateView = () => {
      if (window.innerWidth < 640) {
        setView(Views.DAY);
      } else if (window.innerWidth < 768) {
        setView(Views.WEEK);
      } else {
        setView(Views.MONTH);
      }
    };

    updateView();
    window.addEventListener("resize", updateView);

    return () => window.removeEventListener("resize", updateView);
  }, []);

  if (isLoading) {
    return (
      <div className="mt-[70px]">
        <SkeletonLoader height={1000} count={1} />
      </div>
    );
  }
  if (eventsError) {
    return <p>Error: {eventsError.message || "An unknown error occurred"}</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-2 sm:p-4 md:p-6 mb-20">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6">
        <div className="flex space-x-2 sm:space-x-4 mb-2 sm:mb-0">
          <NavButton onClick={() => navigateCalendar("PREV")} label="<" />
          <NavButton onClick={() => navigateCalendar("TODAY")} label="Hoy" />
          <NavButton onClick={() => navigateCalendar("NEXT")} label=">" />
        </div>
        <div className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-0">
          {moment(date).format("MMMM YYYY")}
        </div>
        <div className="flex flex-wrap justify-center sm:justify-end space-x-2">
          {[
            { label: "Día", value: Views.DAY },
            { label: "Semana", value: Views.WEEK },
            { label: "Mes", value: Views.MONTH },
          ].map((viewOption) => (
            <ViewButton
              key={viewOption.value}
              view={viewOption.value} // Asegúrate de pasar el valor en inglés
              currentView={view}
              onClick={() => setView(viewOption.value)} // Asegúrate de establecer el valor correcto
            />
          ))}
        </div>
      </div>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="startTime"
        endAccessor="endTime"
        views={["day", "week", "month"]}
        view={view}
        date={date}
        onNavigate={setDate}
        onView={setView}
        min={new Date(2024, 0, 1, 8, 0, 0)}
        max={new Date(2024, 11, 31, 22, 0, 0)}
        className="rounded-xl overflow-hidden"
        style={{ height: "calc(100vh - 200px)" }}
        formats={{
          dayFormat: (date, culture, localizer) =>
            localizer?.format(date, "ddd DD", culture) ?? "",
          eventTimeRangeFormat: () => "",
        }}
        components={{
          event: (props: { event: Event }) => (
            <div
              className="bg-lightBlue text-white p-1 rounded text-xs sm:text-sm"
              onClick={() =>
                handleEventClick({
                  ...props.event,
                  date: props.event.date,
                  startTime: new Date(props.event.startTime).toISOString(),
                  endTime: new Date(props.event.endTime).toISOString(),
                  user_uid: props.event.user_uid,
                  title: props.event.title,
                  description: props.event.description,
                })
              }
            >
              <span>{formatEventTime(new Date(props.event.startTime))}</span>
              {" - "}
              {props.event.title}
            </div>
          ),
        }}
      />
      <EventModal
        isOpen={isModalOpen}
        onClose={closeModal}
        event={selectedEvent}
      />
    </div>
  );
};

// Generic Button component
const Button = ({
  onClick,
  label,
  isActive = false,
}: {
  onClick: () => void;
  label: string;
  isActive?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`px-2 sm:px-4 py-1 sm:py-2 rounded-xl shadow-md transition-all duration-300 font-semibold text-sm sm:text-base ${
      isActive
        ? "bg-mediumBlue text-white hover:bg-lightBlue"
        : "bg-[#A8E0FF]/10 text-[#5EAAD7] hover:bg-[#A8E0FF]/20"
    }`}
  >
    {label}
  </button>
);

// Define NavButton and ViewButton as regular components
const NavButton = ({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) => <Button onClick={onClick} label={label} />;

const ViewButton = ({
  view,
  currentView,
  onClick,
}: {
  view: View;
  currentView: View;
  onClick: () => void;
}) => (
  <Button
    onClick={onClick}
    label={view === "day" ? "Día" : view === "week" ? "Semana" : "Mes"}
    isActive={currentView === view}
  />
);

export default BigCalendar;
