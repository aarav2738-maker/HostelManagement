import type { Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCategoryInfo, getPriorityInfo, getStatusInfo } from '@/lib/constants';
import { formatDistanceToNow } from 'date-fns';
import { Clock, MapPin, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';


interface ComplaintCardProps {
  complaint: Complaint;
  onClick?: () => void;
  showFeedbackButton?: boolean;
}

export function ComplaintCard({ complaint, onClick }: ComplaintCardProps) {
  const category = getCategoryInfo(complaint.category);
  const priority = getPriorityInfo(complaint.priority);
  const status = getStatusInfo(complaint.status);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card 
        className="cursor-pointer border-l-[6px] shadow-sm hover:shadow-xl transition-all duration-300 bg-card/60 backdrop-blur-md overflow-hidden relative group"
        style={{ borderLeftColor: `hsl(var(--status-${complaint.status.replace('_', '-')}))` }}
        onClick={onClick}
      >
        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl shadow-inner">
                {category.icon}
              </div>
              <div>
                <CardTitle className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">
                  {complaint.title}
                </CardTitle>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
            <Badge className={`${status.color} text-white shadow-sm shrink-0 font-medium px-3 py-1 rounded-full`}>
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground/90 line-clamp-2 leading-relaxed">
            {complaint.description}
          </p>
          
          <div className="flex items-center gap-4 text-xs font-medium text-foreground">
            <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span>Room {complaint.room_number}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
            <Badge variant="outline" className="text-xs bg-background/50">
              {category.label}
            </Badge>
            <Badge className={`${priority.color} text-white text-xs shadow-sm`}>
              {priority.label}
            </Badge>
          </div>

          {complaint.image_url && (
            <div className="mt-3 overflow-hidden rounded-xl">
              <img 
                src={complaint.image_url} 
                alt="Complaint" 
                className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
