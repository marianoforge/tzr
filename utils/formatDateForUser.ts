// utils/formatDate.ts
import { toZonedTime, format } from "date-fns-tz";

export const formatDateForUser = (
  utcDateString: string,
  userTimeZone: string
) => {
  const utcDate = new Date(utcDateString);
  const zonedDate = toZonedTime(utcDate, userTimeZone);
  return format(zonedDate, "dd/MM/yyyy HH:mm:ss");
};
