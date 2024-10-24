// utils/formatDate.ts
import { toZonedTime, format } from "date-fns-tz";

export const formatDateForUser = (
  utcDateString: string,
  userTimeZone: string
) => {
  console.log(`Received utcDateString: ${utcDateString}`); // Debugging log

  const utcDate = new Date(utcDateString);

  // Check if the date is valid
  if (isNaN(utcDate.getTime())) {
    console.error(`Invalid date string: ${utcDateString}`);
    throw new RangeError("Invalid time value");
  }

  const zonedDate = toZonedTime(utcDate, userTimeZone);
  return format(zonedDate, "dd/MM/yyyy HH:mm:ss");
};
