import { format, subDays } from "date-fns";

export function randomDateLast7Days() {
  const now = new Date();

  // Generar un número aleatorio entre 0 y 6 (días atrás)
  const daysAgo = Math.floor(Math.random() * 7);

  // Restar esos días a la fecha actual
  const baseDate = subDays(now, daysAgo);

  // Generar hora y minutos aleatorios
  const randomHours = Math.floor(Math.random() * 24);
  const randomMinutes = Math.floor(Math.random() * 60);

  // Crear nueva fecha con hora/minutos aleatorios
  const randomDate = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    randomHours,
    randomMinutes
  );

  // Formatear en el formato requerido
  return format(randomDate, "yyyy-MM-dd'T'HH:mm");
}