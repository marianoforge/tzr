"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useEffect } from "react";

const localizer = momentLocalizer(moment);

// Definimos la interfaz para los eventos
interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  user_uid: string;
}

const BigCalendar = () => {
  const [view, setView] = useState<View>(Views.WORK_WEEK);
  const [date, setDate] = useState(new Date(2024, 8, 26)); // Cambiado para centrarse en septiembre 2024
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (response.ok) {
          const data = await response.json();

          setEvents(data);
        } else {
          console.error("Error fetching events:", response.statusText);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchEvents();
  }, []);

  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: new Date(`${event.date}T${event.startTime}`),
    end: new Date(`${event.date}T${event.endTime}`),
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

  return (
    <div className="bg-white rounded-lg shadow-md p-2 sm:p-4 md:p-6">
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
          {["work_week", "day", "week", "month"].map((viewOption) => (
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
        startAccessor="start"
        endAccessor="end"
        views={["work_week", "day", "week", "month"]}
        view={view}
        date={date}
        onNavigate={setDate}
        onView={setView}
        min={new Date(2024, 0, 1, 8, 0, 0)} // Cambiado para permitir eventos en 2024
        max={new Date(2024, 11, 31, 22, 0, 0)} // Cambiado para permitir eventos en 2024
        className="rounded-lg overflow-hidden"
        style={{ height: "calc(100vh - 200px)" }}
        formats={{
          dayFormat: (date, culture, localizer) =>
            localizer?.format(date, "ddd DD", culture) ?? "",
          eventTimeRangeFormat: () => "", // Esto elimina el rango de tiempo sobre el evento
        }}
        components={{
          event: (props) => (
            <div className="bg-[#5EAAD7] text-white p-1 rounded text-xs sm:text-sm">
              <span>{formatEventTime(props.event.start)}</span>
              {" - "}
              {props.title}
            </div>
          ),
        }}
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
    className="bg-[#A8E0FF]/10 text-[#5EAAD7] px-2 sm:px-4 py-1 sm:py-2 rounded-lg shadow-md hover:bg-[#A8E0FF]/20 transition-all duration-300 font-semibold text-sm sm:text-base"
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
        ? "bg-[#7ed994] text-white font-semibold hover:bg-[#7ED994]/80"
        : "bg-gray-200 text-gray-600 hover:bg-gray-300 font-semibold"
    }`}
  >
    {view.charAt(0).toUpperCase() + view.slice(1)}
  </button>
);

export default BigCalendar;
