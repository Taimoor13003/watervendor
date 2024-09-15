import { format } from 'date-fns';

//serialize data
export const serializeDate = (date: Date | null) => (date ? format(new Date(date), 'yyyy-MM-dd') : null);