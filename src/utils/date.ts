import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);

export const formatDate = (dateString: string, format = 'MMM D, YYYY'): string => {
  if (!dateString) return '';
  return dayjs(dateString).format(format);
};

export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';
  return dayjs(dateString).format('MMM D, YYYY h:mm A');
};

export const getDaysRemaining = (endDate: string): number => {
  if (!endDate) return 0;
  const today = dayjs().startOf('day');
  const end = dayjs(endDate).startOf('day');
  return end.diff(today, 'day');
};

export const isDateInPast = (dateString: string): boolean => {
  if (!dateString) return false;
  return dayjs(dateString).isBefore(dayjs(), 'day');
};

export const isDateInFuture = (dateString: string): boolean => {
  if (!dateString) return false;
  return dayjs(dateString).isAfter(dayjs(), 'day');
};

export const formatDateRange = (startDate: string, endDate: string): string => {
  if (!startDate || !endDate) return '';
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  
  if (start.isSame(end, 'day')) {
    return start.format('MMM D, YYYY');
  }
  
  if (start.isSame(end, 'month')) {
    return `${start.format('MMM D')} - ${end.format('D, YYYY')}`;
  }
  
  if (start.isSame(end, 'year')) {
    return `${start.format('MMM D')} - ${end.format('MMM D, YYYY')}`;
  }
  
  return `${start.format('MMM D, YYYY')} - ${end.format('MMM D, YYYY')}`;
};

export const getTimeAgo = (dateString: string): string => {
  if (!dateString) return '';
  return dayjs(dateString).fromNow();
};
