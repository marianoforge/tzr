"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useEffect } from "react";
import { useEventsStore } from "@/stores/useEventsStore";
import { useAuthStore } from "@/stores/authStore";
import EventModal from "./Events/EventModal";
import { Event } from "@/types";

const localizer = momentLocalizer(moment);

const BigCalendar = () => {
  const { events, fetchEvents } = useEventsStore();
  const { userID } = useAuthStore();
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date(2024, 8, 26));
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (userID) {
      fetchEvents(userID);
    }
  }, [userID, fetchEvents]);

  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    date: event.date,
    startTime: new Date(`${event.date}T${event.startTime}`),
    endTime: new Date(`${event.date}T${event.endTime}`),
    description: event.description,
    user_uid: event.user_uid,
  }));

  const navigateCalendar = (action: "PREV" | "NEXT" | "TODAY") => {
    switch (action) {
      case "PREV":
        setDate((prevDate) => {
          const newDate = new Date(prevDate);
          newDate.setDate(newDate.getDate() - 7);
          return newDate;
        });
        break;
      case "NEXT":
        setDate((prevDate) => {
          const newDate = new Date(prevDate);
          newDate.setDate(newDate.getDate() + 7);
          return newDate;
        });
        break;
      case "TODAY":
        setDate(new Date());
        break;
    }
  };

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

  return (
    <div className="bg-white rounded-xl shadow-md p-2 sm:p-4 md:p-6">
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
          {["día", "semana", "mes"].map((viewOption) => (
            <ViewButton
              key={viewOption}
              view={viewOption as View}
              currentView={view}
              onClick={() => setView(viewOption as View)}
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
          event: (props) => (
            <div
              className="bg-lightBlue text-white p-1 rounded text-xs sm:text-sm"
              onClick={() =>
                handleEventClick({
                  ...props.event,
                  date: props.event.date,
                  startTime: props.event.startTime.toISOString(),
                  endTime: props.event.endTime.toISOString(),
                })
              }
            >
              <span>{formatEventTime(props.event.startTime)}</span>
              {" - "}
              {props.title}
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

const NavButton = ({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) => (
  <button
    onClick={onClick}
    className="bg-[#A8E0FF]/10 text-[#5EAAD7] px-2 sm:px-4 py-1 sm:py-2 rounded-xl shadow-md hover:bg-[#A8E0FF]/20 transition-all duration-300 font-semibold text-sm sm:text-base"
  >
    {label}
  </button>
);

const ViewButton = ({
  view,
  currentView,
  onClick,
}: {
  view: string;
  currentView: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-2 sm:px-3 py-1 rounded-md transition-all duration-300 text-xs sm:text-sm ${
      currentView === view
        ? "bg-greenAccent text-white font-semibold hover:bg-green-600"
        : "bg-gray-200 text-gray-600 hover:bg-gray-300 font-semibold"
    }`}
  >
    {view.charAt(0).toUpperCase() + view.slice(1)}
  </button>
);

export default BigCalendar;
