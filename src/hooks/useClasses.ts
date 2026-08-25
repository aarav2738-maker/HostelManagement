import { useState, useEffect } from 'react';
import { ClassEntry, DAYS_OF_WEEK } from '@/types/class';

const STORAGE_KEY = 'class-routine-classes';

const defaultClasses: ClassEntry[] = [
  {
    id: '1',
    subject: 'Mathematics',
    room: 'Room 101',
    startTime: '09:00',
    endTime: '10:30',
    day: 'Monday',
    color: 'blue',
    alarmEnabled: true,
    alarmMinutesBefore: 10,
  },
  {
    id: '2',
    subject: 'Physics',
    room: 'Lab 3',
    startTime: '11:00',
    endTime: '12:30',
    day: 'Monday',
    color: 'teal',
    alarmEnabled: true,
    alarmMinutesBefore: 10,
  },
  {
    id: '3',
    subject: 'English Literature',
    room: 'Room 205',
    startTime: '09:00',
    endTime: '10:30',
    day: 'Tuesday',
    color: 'pink',
    alarmEnabled: false,
    alarmMinutesBefore: 10,
  },
  {
    id: '4',
    subject: 'Computer Science',
    room: 'Lab 1',
    startTime: '14:00',
    endTime: '15:30',
    day: 'Wednesday',
    color: 'violet',
    alarmEnabled: true,
    alarmMinutesBefore: 15,
  },
  {
    id: '5',
    subject: 'Chemistry',
    room: 'Lab 2',
    startTime: '10:00',
    endTime: '11:30',
    day: 'Thursday',
    color: 'orange',
    alarmEnabled: true,
    alarmMinutesBefore: 10,
  },
  {
    id: '6',
    subject: 'History',
    room: 'Room 302',
    startTime: '13:00',
    endTime: '14:30',
    day: 'Friday',
    color: 'green',
    alarmEnabled: false,
    alarmMinutesBefore: 10,
  },
];

export function useClasses() {
  const [classes, setClasses] = useState<ClassEntry[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultClasses;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
  }, [classes]);

  const addClass = (classEntry: Omit<ClassEntry, 'id'>) => {
    const newClass: ClassEntry = {
      ...classEntry,
      id: Date.now().toString(),
    };
    setClasses((prev) => [...prev, newClass]);
  };

  const updateClass = (id: string, updates: Partial<ClassEntry>) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleAlarm = (id: string) => {
    setClasses((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, alarmEnabled: !c.alarmEnabled } : c
      )
    );
  };

  const getClassesByDay = (day: string) => {
    return classes
      .filter((c) => c.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getCurrentDay = (): string => {
    const dayIndex = new Date().getDay();
    // JavaScript's getDay() returns 0 for Sunday
    return dayIndex === 0 ? DAYS_OF_WEEK[6] : DAYS_OF_WEEK[dayIndex - 1];
  };

  return {
    classes,
    addClass,
    updateClass,
    deleteClass,
    toggleAlarm,
    getClassesByDay,
    getCurrentDay,
  };
}
