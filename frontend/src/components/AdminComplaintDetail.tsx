import { useEffect, useState } from 'react';
import type { Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus } from '@/lib/types';
import { useComplaints } from '@/hooks/useComplaints';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCategoryInfo, getPriorityInfo, getStatusInfo, STATUSES } from '@/lib/constants';
import { formatDistanceToNow, format } from 'date-fns';
import { Clock, MapPin, MessageSquare, Loader2 } from 'lucide-react';


interface AdminComplaintDetailProps {
  complaint: Complaint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminComplaintDetail({ complaint, open, onOpenChange }: AdminComplaintDetailProps) {
  const [status, setStatus] = useState<ComplaintStatus>(complaint?.status || 'pending');
  const [adminNotes, setAdminNotes] = useState(complaint?.admin_notes || '');
  const { updateStatus } = useComplaints();

  // Re-sync local state whenever a different complaint is opened
  useEffect(() => {
    if (complaint) {
      setStatus(complaint.status);
      setAdminNotes(complaint.admin_notes || '');
    }
  }, [complaint]);

  if (!complaint) return null;

  const category = getCategoryInfo(complaint.category);
  const priority = getPriorityInfo(complaint.priority);
  const currentStatus = getStatusInfo(complaint.status);

  const handleUpdateStatus = async () => {
    await updateStatus.mutateAsync({
      id: complaint.id,
      status,
      adminNotes,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{category.icon}</span>
            <DialogTitle className="text-xl">{complaint.title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge className={`${currentStatus.color} text-white`}>
              {currentStatus.label}
            </Badge>
            <Badge variant="outline">{category.label}</Badge>
            <Badge className={`${priority.color} text-white`}>
              {priority.label} Priority
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>Room {complaint.room_number}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}</span>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {complaint.description}
            </p>
          </div>

          {complaint.image_url && (
            <div>
              <h4 className="font-medium mb-2">Attached Image</h4>
              <img 
                src={complaint.image_url} 
                alt="Complaint" 
                className="w-full max-h-64 object-contain rounded-lg bg-muted"
              />
            </div>
          )}

          {complaint.resolved_at && (
            <div className="text-sm text-muted-foreground">
              <strong>Resolved:</strong> {format(new Date(complaint.resolved_at), 'PPp')}
            </div>
          )}

          {/* Admin actions */}
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Admin Actions
            </h4>

            <div className="space-y-2">
              <Label htmlFor="status">Update Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ComplaintStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminNotes">Admin Notes</Label>
              <Textarea
                id="adminNotes"
                placeholder="Add notes about resolution, actions taken, etc..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button 
              className="w-full" 
              onClick={handleUpdateStatus}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Complaint'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
