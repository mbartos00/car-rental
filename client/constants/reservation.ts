export const TIME_OPTIONS = Array.from(
  { length: 13 },
  (_, index) => `${String(index + 8).padStart(2, "0")}:00`
);
