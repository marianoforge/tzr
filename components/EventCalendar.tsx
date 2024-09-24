"use client";

import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

const EventCalendar = () => {
  const [value, onChange] = useState<Value>(new Date());
  return (
    <div className="bg-white flex p-7 rounded-lg">
      <Calendar onChange={onChange} value={value} />
      <div className="flex items-center justify-between">
        {/* <Image src="/moreDark.png" alt="" width={20} height={20} /> */}
      </div>
    </div>
  );
};

export default EventCalendar;
