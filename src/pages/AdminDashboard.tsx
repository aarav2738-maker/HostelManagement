import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useComplaints } from '@/hooks/useComplaints';
import { useFeedback } from '@/hooks/useFeedback';
import { ComplaintCard } from '@/components/ComplaintCard';
import { AdminComplaintDetail } from '@/components/AdminComplaintDetail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database } from '@/integrations/supabase/types';
import { CATEGORIES, PRIORITIES } from '@/lib/constants';
import { LogOut, Search, Clock, CheckCircle2, AlertCircle, Users, Star, Loader2, Filter, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

type Complaint = Database['public']['Tables']['complaints']['Row'];
type ComplaintCategory = Database['public']['Enums']['complaint_category'];
type ComplaintPriority = Database['public']['Enums']['complaint_priority'];

export default function AdminDashboard() {
  const { signOut } = useAuthContext();
  const { complaints, isLoading } = useComplaints();
  const { feedback } = useFeedback();
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<ComplaintCategory | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<ComplaintPriority | 'all'>('all');
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch = 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.room_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || c.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || c.priority === filterPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const pendingComplaints = filteredComplaints.filter(c => c.status === 'pending');
  const inProgressComplaints = filteredComplaints.filter(c => c.status === 'in_progress');
  const resolvedComplaints = filteredComplaints.filter(c => c.status === 'resolved');

  // Analytics
  const totalComplaints = complaints.length;
  const avgRating = feedback.length > 0
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : 'N/A';
  const urgentCount = complaints.filter(c => c.priority === 'urgent' && c.status !== 'resolved').length;
  const uniqueRooms = new Set(complaints.map(c => c.room_number)).size;

  // Category breakdown
  const categoryStats = CATEGORIES.map(cat => ({
    ...cat,
    count: complaints.filter(c => c.category === cat.value).length,
  })).sort((a, b) => b.count - a.count);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-gradient-premium">
      {/* Header */}
      <header className="bg-background/70 backdrop-blur-lg border-b border-border/50 sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white shadow-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Hostel Complaint Management
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{totalComplaints}</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-t-4 border-t-status-pending">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-status-pending flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{complaints.filter(c => c.status === 'pending').length}</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-t-4 border-t-status-in-progress">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-status-in-progress flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" /> In Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{complaints.filter(c => c.status === 'in_progress').length}</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-t-4 border-t-status-resolved">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-status-resolved flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Resolved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{complaints.filter(c => c.status === 'resolved').length}</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-t-4 border-t-yellow-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" /> Avg Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{avgRating}</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-t-4 border-t-destructive">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-destructive flex items-center gap-1">
                  🚨 Urgent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{urgentCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* Category breakdown */}
          <Card className="mb-8 glass-card">
          <CardHeader>
            <CardTitle className="text-base">Complaints by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {categoryStats.map((cat) => (
                <div 
                  key={cat.value}
                  className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg"
                >
                  <span>{cat.icon}</span>
                  <span className="text-sm font-medium">{cat.label}</span>
                  <Badge variant="secondary">{cat.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, description, or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as any)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v as any)}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {PRIORITIES.map((pri) => (
                <SelectItem key={pri.value} value={pri.value}>
                  {pri.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Complaints list */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingComplaints.length})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({inProgressComplaints.length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({resolvedComplaints.length})</TabsTrigger>
            <TabsTrigger value="all">All ({filteredComplaints.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingComplaints.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No pending complaints</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingComplaints.map((complaint) => (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    onClick={() => setSelectedComplaint(complaint)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="in_progress" className="space-y-4">
            {inProgressComplaints.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No complaints in progress</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {inProgressComplaints.map((complaint) => (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    onClick={() => setSelectedComplaint(complaint)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4">
            {resolvedComplaints.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No resolved complaints</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {resolvedComplaints.map((complaint) => (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    onClick={() => setSelectedComplaint(complaint)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No complaints found</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredComplaints.map((complaint) => (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    onClick={() => setSelectedComplaint(complaint)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        </motion.div>
      </main>

      <AdminComplaintDetail
        complaint={selectedComplaint}
        open={!!selectedComplaint}
        onOpenChange={(open) => !open && setSelectedComplaint(null)}
      />
    </div>
  );
}
