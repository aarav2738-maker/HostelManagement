import { motion } from 'framer-motion';
import { ClassEntry, DayOfWeek } from '@/types/class';
import { ClassCard } from './ClassCard';
import { cn } from '@/lib/utils';

interface DayColumnProps {
  day: DayOfWeek;
  classes: ClassEntry[];
  isToday: boolean;
  onToggleAlarm: (id: string) => void;
  onEdit: (classEntry: ClassEntry) => void;
  onDelete: (id: string) => void;
}

export function DayColumn({
  day,
  classes,
  isToday,
  onToggleAlarm,
  onEdit,
  onDelete,
}: DayColumnProps) {
  const shortDay = day.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col"
    >
      <div
        className={cn(
          'mb-4 rounded-lg p-3 text-center transition-colors',
          isToday
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground'
        )}
      >
        <div className="text-xs font-medium uppercase tracking-wide opacity-80">
          {shortDay}
        </div>
        <div className="text-lg font-bold">{day}</div>
        {isToday && (
          <div className="mt-1 text-xs font-medium">Today</div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {classes.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No classes
          </div>
        ) : (
          classes.map((classEntry) => (
            <ClassCard
              key={classEntry.id}
              classEntry={classEntry}
              onToggleAlarm={() => onToggleAlarm(classEntry.id)}
              onEdit={() => onEdit(classEntry)}
              onDelete={() => onDelete(classEntry.id)}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}
