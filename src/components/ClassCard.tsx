import { motion } from 'framer-motion';
import { Bell, BellOff, Clock, MapPin, Pencil, Trash2 } from 'lucide-react';
import { ClassEntry, SubjectColor } from '@/types/class';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ClassCardProps {
  classEntry: ClassEntry;
  onToggleAlarm: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const colorClasses: Record<SubjectColor, string> = {
  blue: 'bg-subject-blue/10 border-subject-blue/30 hover:border-subject-blue/50',
  teal: 'bg-subject-teal/10 border-subject-teal/30 hover:border-subject-teal/50',
  orange: 'bg-subject-orange/10 border-subject-orange/30 hover:border-subject-orange/50',
  pink: 'bg-subject-pink/10 border-subject-pink/30 hover:border-subject-pink/50',
  violet: 'bg-subject-violet/10 border-subject-violet/30 hover:border-subject-violet/50',
  green: 'bg-subject-green/10 border-subject-green/30 hover:border-subject-green/50',
};

const accentClasses: Record<SubjectColor, string> = {
  blue: 'bg-subject-blue',
  teal: 'bg-subject-teal',
  orange: 'bg-subject-orange',
  pink: 'bg-subject-pink',
  violet: 'bg-subject-violet',
  green: 'bg-subject-green',
};

export function ClassCard({ classEntry, onToggleAlarm, onEdit, onDelete }: ClassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'relative rounded-xl border-2 p-4 transition-all duration-200',
        colorClasses[classEntry.color]
      )}
    >
      {/* Color accent bar */}
      <div
        className={cn(
          'absolute left-0 top-3 bottom-3 w-1 rounded-full',
          accentClasses[classEntry.color]
        )}
      />

      <div className="pl-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-lg leading-tight">
              {classEntry.subject}
            </h3>
            
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {classEntry.startTime} - {classEntry.endTime}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {classEntry.room}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onToggleAlarm}
            >
              {classEntry.alarmEnabled ? (
                <Bell className="h-4 w-4 text-alarm-active" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {classEntry.alarmEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 text-xs text-muted-foreground"
          >
            <span className="inline-flex items-center gap-1 rounded-full bg-alarm-active/10 px-2 py-0.5 text-alarm-active">
              <Bell className="h-3 w-3" />
              Alarm {classEntry.alarmMinutesBefore}min before
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
