import { motion } from 'framer-motion';
import { Bell, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onAddClass: () => void;
  totalClasses: number;
  activeAlarms: number;
}

export function Header({ onAddClass, totalClasses, activeAlarms }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Calendar className="h-5 w-5" />
            </div>
            Hostel Management
          </h1>
          <p className="mt-1 text-muted-foreground">
            Way to a better hostel
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {totalClasses} classes
            </span>
            <span className="flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-alarm-active" />
              {activeAlarms} alarms
            </span>
          </div>
          
          <Button onClick={onAddClass} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Class
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
