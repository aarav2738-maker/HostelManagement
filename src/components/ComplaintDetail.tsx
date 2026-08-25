import { useState } from 'react';
import { Database } from '@/integrations/supabase/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getCategoryInfo, getPriorityInfo, getStatusInfo } from '@/lib/constants';
import { formatDistanceToNow, format } from 'date-fns';
import { Clock, MapPin, Star, MessageSquare } from 'lucide-react';
import { useFeedback } from '@/hooks/useFeedback';

type Complaint = Database['public']['Tables']['complaints']['Row'];

interface ComplaintDetailProps {
  complaint: Complaint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ComplaintDetail({ complaint, open, onOpenChange }: ComplaintDetailProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const { createFeedback, getFeedbackForComplaint } = useFeedback();

  if (!complaint) return null;

  const category = getCategoryInfo(complaint.category);
  const priority = getPriorityInfo(complaint.priority);
  const status = getStatusInfo(complaint.status);
  const existingFeedback = getFeedbackForComplaint(complaint.id);
  const canGiveFeedback = complaint.status === 'resolved' && !existingFeedback;

  const handleSubmitFeedback = async () => {
    await createFeedback.mutateAsync({
      complaint_id: complaint.id,
      rating,
      comment: comment || null,
    });
    setRating(5);
    setComment('');
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
            <Badge className={`${status.color} text-white`}>
              {status.label}
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

          {complaint.admin_notes && (
            <div className="bg-primary/10 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Admin Notes
              </h4>
              <p className="text-sm text-muted-foreground">
                {complaint.admin_notes}
              </p>
            </div>
          )}

          {complaint.resolved_at && (
            <div className="text-sm text-muted-foreground">
              <strong>Resolved:</strong> {format(new Date(complaint.resolved_at), 'PPp')}
            </div>
          )}

          {existingFeedback && (
            <div className="bg-accent/10 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Your Feedback</h4>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= existingFeedback.rating
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              {existingFeedback.comment && (
                <p className="text-sm text-muted-foreground">{existingFeedback.comment}</p>
              )}
            </div>
          )}

          {canGiveFeedback && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Rate this resolution</h4>
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-muted-foreground hover:text-yellow-400'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">Comment (optional)</Label>
                <Textarea
                  id="comment"
                  placeholder="Share your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
              </div>
              <Button 
                className="mt-3 w-full" 
                onClick={handleSubmitFeedback}
                disabled={createFeedback.isPending}
              >
                Submit Feedback
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
