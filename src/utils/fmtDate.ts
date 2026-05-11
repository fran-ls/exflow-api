import { format as fnsFormat } from 'date-fns';
import { es } from 'date-fns/locale';

export const getFmtDate = (date: Date, format: string) => {
  if (format) {
    return fnsFormat(date, format, { locale: es });
  }

  const fmtDate = fnsFormat(date, 'yyyy-MM-dd hh:mm/aaa', { locale: es });
  const parts = fmtDate.split(' ');
  const time = parts[1].toUpperCase();

  return `${parts[0]} ${time.toUpperCase()}`;
}