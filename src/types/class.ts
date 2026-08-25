export type SubjectColor = 'blue' | 'teal' | 'orange' | 'pink' | 'violet' | 'green';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface ClassEntry {
  id: string;
  subject: string;
  room: string;
  startTime: string;
  endTime: string;
  day: DayOfWeek;
  color: SubjectColor;
  alarmEnabled: boolean;
  alarmMinutesBefore: number;
}

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const SUBJECT_COLORS: SubjectColor[] = [
  'blue',
  'teal',
  'orange',
  'pink',
  'violet',
  'green',
];

export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00',
];
