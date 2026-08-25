import { useState, useEffect } from 'react';
import { ClassEntry, DayOfWeek, SubjectColor, DAYS_OF_WEEK, SUBJECT_COLORS, TIME_SLOTS } from '@/types/class';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface ClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (classEntry: Omit<ClassEntry, 'id'>) => void;
  editingClass?: ClassEntry | null;
}

const colorLabels: Record<SubjectColor, string> = {
  blue: 'Blue',
  teal: 'Teal',
  orange: 'Orange',
  pink: 'Pink',
  violet: 'Violet',
  green: 'Green',
};

export function ClassFormDialog({
  open,
  onOpenChange,
  onSubmit,
  editingClass,
}: ClassFormDialogProps) {
  const [subject, setSubject] = useState('');
  const [room, setRoom] = useState('');
  const [day, setDay] = useState<DayOfWeek>('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [color, setColor] = useState<SubjectColor>('blue');
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [alarmMinutesBefore, setAlarmMinutesBefore] = useState(10);

  useEffect(() => {
    if (editingClass) {
      setSubject(editingClass.subject);
      setRoom(editingClass.room);
      setDay(editingClass.day);
      setStartTime(editingClass.startTime);
      setEndTime(editingClass.endTime);
      setColor(editingClass.color);
      setAlarmEnabled(editingClass.alarmEnabled);
      setAlarmMinutesBefore(editingClass.alarmMinutesBefore);
    } else {
      resetForm();
    }
  }, [editingClass, open]);

  const resetForm = () => {
    setSubject('');
    setRoom('');
    setDay('Monday');
    setStartTime('09:00');
    setEndTime('10:30');
    setColor('blue');
    setAlarmEnabled(true);
    setAlarmMinutesBefore(10);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !room.trim()) return;

    onSubmit({
      subject: subject.trim(),
      room: room.trim(),
      day,
      startTime,
      endTime,
      color,
      alarmEnabled,
      alarmMinutesBefore,
    });

    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingClass ? 'Edit Class' : 'Add New Class'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="e.g., Mathematics"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="room">Room / Location</Label>
            <Input
              id="room"
              placeholder="e.g., Room 101"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Day</Label>
            <Select value={day} onValueChange={(v) => setDay(v as DayOfWeek)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {SUBJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'h-8 w-8 rounded-full transition-all',
                    `bg-subject-${c}`,
                    color === c
                      ? 'ring-2 ring-offset-2 ring-foreground scale-110'
                      : 'hover:scale-105'
                  )}
                  title={colorLabels[c]}
                />
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-secondary p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="alarm" className="cursor-pointer">
                Enable Alarm
              </Label>
              <Switch
                id="alarm"
                checked={alarmEnabled}
                onCheckedChange={setAlarmEnabled}
              />
            </div>

            {alarmEnabled && (
              <div className="space-y-2">
                <Label>Minutes Before</Label>
                <Select
                  value={alarmMinutesBefore.toString()}
                  onValueChange={(v) => setAlarmMinutesBefore(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editingClass ? 'Save Changes' : 'Add Class'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
