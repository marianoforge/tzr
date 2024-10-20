export const formatEventDateTime = (date: Date) => {
  return date.toLocaleString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDateTime = (date: Date) => {
  return date.toLocaleString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
