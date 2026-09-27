import { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useComplaints } from '@/hooks/useComplaints';
import { useMessMenu, todayMenuIndex } from '@/hooks/useMessMenu';
import { useRoomRequests } from '@/hooks/useRoomRequests';
import { useRoommates } from '@/hooks/useRoommates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LogOut, Plus, Clock, CheckCircle2, Search, Bell, Home, LayoutDashboard, MessageSquare, ClipboardList, Utensils, User, Mail, BookOpen, AlertCircle, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ComplaintForm from '@/components/ComplaintForm';
import { ComplaintCard } from '@/components/ComplaintCard';
import { ComplaintDetail } from '@/components/ComplaintDetail';
import type { Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus, StudentSuggestion } from '@/lib/types';
import { toast } from 'sonner';


// --- MOCK DATA ---
const MOCK_NOTICES = [
  { id: 1, title: 'Hostel Maintenance Drive', date: '2026-08-15', desc: 'Routine maintenance of electrical appliances will be conducted this weekend.', type: 'info' },
  { id: 2, title: 'Mess Fee Due Date', date: '2026-08-20', desc: 'Please clear your mess dues for this month before the 20th to avoid late fees.', type: 'warning' },
  { id: 3, title: 'Upcoming Cultural Night', date: '2026-08-25', desc: 'Join us for the annual hostel cultural night in the main courtyard!', type: 'success' },
];

const MOCK_ROOMMATES = [
  { name: 'Rahul Sharma', course: 'B.Tech CS', phone: '+91 9876543210' },
  { name: 'Amit Kumar', course: 'B.Tech ECE', phone: '+91 9876543211' }
];

const MEAL_TIMES = { breakfast: '8:00 AM', lunch: '1:00 PM', dinner: '8:00 PM' } as const;

export default function StudentDashboard() {
  const { user, signOut, updateProfile } = useAuthContext();
  const { complaints, isLoading } = useComplaints();
  const { menu, updateDay } = useMessMenu();
  const { requests, createRequest } = useRoomRequests();
  const { roommates, createRequest: createRoommateRequest, searchStudents } = useRoommates();
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [requestOpen, setRequestOpen] = useState(false);
  const [roommateEditOpen, setRoommateEditOpen] = useState(false);
  const [removeRoommates, setRemoveRoommates] = useState<string[]>([]);
  const [roommateName, setRoommateName] = useState('');
  const [studentSuggestions, setStudentSuggestions] = useState<StudentSuggestion[]>([]);
  const [newRoommates, setNewRoommates] = useState<Array<{ student_id?: string; name: string; course?: string; phone?: string }>>([]);
  const [roommateReason, setRoommateReason] = useState('');
  const [requestedRoom, setRequestedRoom] = useState('');
  const [requestReason, setRequestReason] = useState('');
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    room_number: '',
  });
  const navigate = useNavigate();

  const profile = {
    full_name: user?.user_metadata?.full_name || 'Alex Student',
    room_number: user?.user_metadata?.room_number || 'A-101',
    phone: user?.user_metadata?.phone || 'Not set',
    course: 'B.Tech Computer Science',
    email: user?.email || 'student@example.com',
  };

  // Re-sync the editable profile form whenever the Profile tab is opened
  useEffect(() => {
    if (activeTab === 'profile') {
      setProfileForm({
        full_name: user?.user_metadata?.full_name ?? '',
        phone: user?.user_metadata?.phone ?? '',
        room_number: user?.user_metadata?.room_number ?? '',
      });
    }
  }, [activeTab, user?.user_metadata?.full_name, user?.user_metadata?.phone, user?.user_metadata?.room_number, user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSaveProfile = async () => {
    if (!profileForm.full_name.trim() || !profileForm.room_number.trim()) {
      toast.error('Name and room number are required.');
      return;
    }
    const { error } = await updateProfile({
      full_name: profileForm.full_name.trim(),
      phone: profileForm.phone.trim(),
      room_number: profileForm.room_number.trim().toUpperCase(),
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Profile updated successfully!');
    }
  };

  const handleSubmitRoomRequest = async () => {
    if (!requestedRoom.trim()) {
      toast.error('Please enter your preferred room.');
      return;
    }
    try {
      await createRequest.mutateAsync({
        requested_room: requestedRoom.trim().toUpperCase(),
        reason: requestReason.trim(),
      });
      setRequestedRoom('');
      setRequestReason('');
      setRequestOpen(false);
    } catch {
      // Error toast is shown by the mutation's onError
    }
  };

  const myRequests = requests.filter(r => r.user_id === user?.id);
  const latestRequest = myRequests[0];
  const displayedRoommates = roommates.length > 0
    ? roommates.map((roommate) => ({ name: roommate.roommate_name, course: roommate.roommate_course ?? 'Student', phone: roommate.roommate_phone ?? '' }))
    : MOCK_ROOMMATES;

  useEffect(() => {
    if (!roommateEditOpen || !roommateName.trim()) {
      setStudentSuggestions([]);
      return;
    }
    searchStudents(roommateName.trim()).then(setStudentSuggestions).catch(() => setStudentSuggestions([]));
  }, [roommateEditOpen, roommateName, searchStudents]);

  const addRoommate = (student?: StudentSuggestion) => {
    const next = student
      ? { student_id: student.id, name: student.full_name, course: 'Student', phone: student.phone ?? '' }
      : { name: roommateName.trim() };
    if (!next.name || newRoommates.some((roommate) => roommate.name.toLowerCase() === next.name.toLowerCase())) return;
    setNewRoommates((current) => [...current, next]);
    setRoommateName('');
    setStudentSuggestions([]);
  };

  const submitRoommateRequest = () => {
    createRoommateRequest.mutate(
      { remove_roommates: removeRoommates, add_roommates: newRoommates, reason: roommateReason },
      { onSuccess: () => { setRoommateEditOpen(false); setRemoveRoommates([]); setNewRoommates([]); setRoommateReason(''); } },
    );
  };

  const search = searchTerm.trim().toLowerCase();
  const userComplaints = complaints.filter(c => c.user_id === user?.id);
  const visibleComplaints = search
    ? userComplaints.filter(c =>
        [c.title, c.description, c.room_number].some(v => v?.toLowerCase().includes(search)),
      )
    : userComplaints;
  const pendingCount = visibleComplaints.filter(c => c.status === 'pending').length;
  const resolvedCount = visibleComplaints.filter(c => c.status === 'resolved').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'room', label: 'My Room', icon: Home },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
    { id: 'noticeboard', label: 'Notice Board', icon: ClipboardList },
    { id: 'messmenu', label: 'Mess Menu', icon: Utensils },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Views Renderers
  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-[20px] border-none shadow-lg shadow-slate-200/50 bg-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <LayoutDashboard className="w-16 h-16 text-primary" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Complaints</p>
            <div className="text-4xl font-bold text-foreground">{userComplaints.length}</div>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border-none shadow-lg shadow-slate-200/50 bg-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Clock className="w-16 h-16 text-primary" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span> Pending
            </p>
            <div className="text-4xl font-bold text-foreground">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border-none shadow-lg shadow-slate-200/50 bg-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-16 h-16 text-accent" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent"></span> Resolved
            </p>
            <div className="text-4xl font-bold text-foreground">{resolvedCount}</div>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border-none shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-secondary text-primary-foreground overflow-hidden relative group cursor-pointer hover:shadow-xl hover:shadow-primary/30 transition-all" onClick={() => setIsFormOpen(true)}>
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform group-hover:rotate-12">
            <Plus className="w-16 h-16 text-white" />
          </div>
          <CardContent className="p-6 relative z-10 h-full flex flex-col justify-center">
            <h3 className="text-xl font-bold mb-1">New Complaint</h3>
            <p className="text-white/80 text-sm">Report an issue in your room</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Complaints Preview */}
      <Card className="rounded-[20px] border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden p-6">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-lg font-bold text-slate-800">Recent Complaints</h3>
           <Button variant="ghost" className="text-primary" onClick={() => setActiveTab('complaints')}>View All</Button>
        </div>
        {isLoading ? (
          <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div></div>
        ) : userComplaints.length === 0 ? (
          <div className="text-center p-8 text-slate-400">No recent complaints.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {userComplaints.slice(0, 3).map(c => (
                <div key={c.id} onClick={() => setSelectedComplaint(c)}><ComplaintCard complaint={c} /></div>
             ))}
          </div>
        )}
      </Card>
    </div>
  );

  const renderComplaints = () => (
    <Card className="rounded-[20px] border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
      <div className="p-6 flex justify-between items-center border-b border-slate-100">
         <h2 className="text-xl font-bold text-slate-800">My Complaints</h2>
         <Button className="bg-primary hover:bg-primary/90 rounded-[10px]" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2"/> New Complaint
         </Button>
      </div>
      {search && (
        <div className="px-6 py-3 bg-accent/15 border-b border-slate-100 flex items-center justify-between text-sm text-slate-600">
          <span>{visibleComplaints.length} result{visibleComplaints.length === 1 ? '' : 's'} for “{searchTerm.trim()}”</span>
          <Button variant="ghost" size="sm" className="h-8 text-slate-500" onClick={() => setSearchTerm('')}>
            <X className="w-4 h-4 mr-1" /> Clear search
          </Button>
        </div>
      )}
      <Tabs defaultValue="all" className="w-full">
        <div className="px-6 pt-6 border-b border-slate-100 flex items-center justify-between">
          <TabsList className="bg-slate-100/80 p-1 rounded-[12px]">
            <TabsTrigger value="all" className="rounded-[10px] data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">All</TabsTrigger>
            <TabsTrigger value="pending" className="rounded-[10px] data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">Pending</TabsTrigger>
            <TabsTrigger value="resolved" className="rounded-[10px] data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">Resolved</TabsTrigger>
          </TabsList>
        </div>

        <div className="p-6 bg-slate-50/50 min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="font-medium text-sm">Loading complaints...</p>
            </div>
          ) : visibleComplaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-4 bg-white rounded-[20px] border border-dashed border-slate-200">
              <CheckCircle2 className="w-16 h-16 text-accent/50" />
              <p className="font-medium">{search ? 'No complaints match your search.' : 'No complaints found. Everything looks good!'}</p>
            </div>
          ) : (
            <>
              <TabsContent value="all" className="mt-0">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {visibleComplaints.map(complaint => (
                    <div key={complaint.id} onClick={() => setSelectedComplaint(complaint)}><ComplaintCard complaint={complaint} /></div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="pending" className="mt-0">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {visibleComplaints.filter(c => c.status === 'pending').map(complaint => (
                    <div key={complaint.id} onClick={() => setSelectedComplaint(complaint)}><ComplaintCard complaint={complaint} /></div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="resolved" className="mt-0">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {visibleComplaints.filter(c => c.status === 'resolved').map(complaint => (
                    <div key={complaint.id} onClick={() => setSelectedComplaint(complaint)}><ComplaintCard complaint={complaint} /></div>
                  ))}
                </div>
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </Card>
  );

  const renderRoom = () => (
    <div className="space-y-6">
       <Card className="rounded-[20px] border-none shadow-md bg-white">
          <CardHeader className="border-b border-slate-100">
             <CardTitle className="text-xl flex items-center gap-2"><Home className="text-primary"/> Room Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col md:flex-row gap-8 items-center md:items-start">
             <div className="w-32 h-32 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                <span className="text-4xl font-extrabold text-primary">{profile.room_number}</span>
             </div>
             <div className="space-y-4 flex-1">
                <div>
                   <p className="text-sm text-slate-500 font-medium">Block / Floor</p>
                   <p className="text-lg font-bold text-slate-800">Block A, 1st Floor</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-xs text-slate-500 mb-1">Room Type</p>
                      <p className="font-semibold text-slate-700">3-Seater Non-AC</p>
                   </div>
                   <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-xs text-slate-500 mb-1">Bed Number</p>
                      <p className="font-semibold text-slate-700">Bed 2</p>
                   </div>
                </div>
             </div>
          </CardContent>
       </Card>

       <div className="flex items-center justify-between mt-8 mb-4 px-2">
          <h3 className="text-lg font-bold text-slate-800">Your Roommates</h3>
         <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" className="text-primary border-primary/30 hover:bg-primary/5" onClick={() => setRequestOpen(true)}>
             Request Room Change
           </Button>
           <Button variant="outline" size="sm" className="text-primary border-primary/30 hover:bg-primary/5" onClick={() => {
            setRemoveRoommates([]);
            setNewRoommates([]);
            setRoommateEditOpen(true);
           }}>
             Edit Roommates
           </Button>
         </div>
       </div>

       {latestRequest && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-[12px] border text-sm font-medium ${
            latestRequest.status === 'pending'
              ? 'bg-amber-50 border-amber-200 text-amber-700'
              : latestRequest.status === 'approved'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}>
             {latestRequest.status === 'pending'
                ? <Clock className="w-4 h-4 shrink-0" />
                : latestRequest.status === 'approved'
                  ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                  : <AlertCircle className="w-4 h-4 shrink-0" />}
             <span>
                Room change {latestRequest.status}: {latestRequest.current_room} → {latestRequest.requested_room}
                {latestRequest.status === 'pending' && ' — waiting for admin approval'}
                {latestRequest.status === 'approved' && ' — log out and back in to see your new room everywhere'}
             </span>
          </div>
       )}

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {displayedRoommates.map((rm, idx) => (
             <Card key={`${rm.name}-${idx}`} className="rounded-xl border-slate-100 shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                   <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-lg">
                      {rm.name.charAt(0)}
                   </div>
                   <div>
                      <p className="font-bold text-slate-800">{rm.name}</p>
                      <p className="text-sm text-slate-500">{rm.course} • {rm.phone}</p>
                   </div>
                </CardContent>
             </Card>
          ))}
       </div>

       <Dialog open={roommateEditOpen} onOpenChange={setRoommateEditOpen}>
         <DialogContent className="sm:max-w-[560px]">
           <DialogHeader>
             <DialogTitle>Edit Roommates</DialogTitle>
             <DialogDescription>
               Select any current roommates to remove, then add registered students or type a name manually. Admin approval is required.
             </DialogDescription>
           </DialogHeader>
           <div className="space-y-5">
             <div className="space-y-2">
               <Label>Current roommates to remove</Label>
               <div className="grid gap-2 sm:grid-cols-2">
                 {displayedRoommates.map((roommate) => {
                  const selected = removeRoommates.includes(roommate.name);
                  return (
                    <button
                     key={roommate.name}
                     type="button"
                     onClick={() => setRemoveRoommates((current) => selected ? current.filter((name) => name !== roommate.name) : [...current, roommate.name])}
                     className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${selected ? 'border-destructive bg-destructive/10 text-destructive' : 'border-border hover:border-primary/50 hover:bg-primary/5'}`}
                    >
                     <span className="font-semibold">{selected ? 'Remove: ' : ''}{roommate.name}</span>
                     <span className="block text-xs text-muted-foreground">{roommate.course}</span>
                    </button>
                  );
                 })}
               </div>
             </div>
             <div className="space-y-2">
               <Label htmlFor="roommateName">Add a roommate</Label>
               <div className="flex gap-2">
                 <Input
                  id="roommateName"
                  value={roommateName}
                  onChange={(event) => setRoommateName(event.target.value)}
                  onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addRoommate(); } }}
                  placeholder="Search a student or type a name"
                 />
                 <Button type="button" variant="outline" onClick={() => addRoommate()} disabled={!roommateName.trim()}>Add</Button>
               </div>
               {studentSuggestions.length > 0 && (
                 <div className="rounded-lg border border-border bg-card p-1 shadow-sm">
                   {studentSuggestions.map((student) => (
                    <button key={student.id} type="button" onClick={() => addRoommate(student)} className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent/15">
                      <span className="font-semibold">{student.full_name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{student.email}{student.room_number ? ` · ${student.room_number}` : ''}</span>
                    </button>
                   ))}
                 </div>
               )}
               {newRoommates.length > 0 && (
                 <div className="flex flex-wrap gap-2">
                   {newRoommates.map((roommate) => (
                    <button key={roommate.name} type="button" onClick={() => setNewRoommates((current) => current.filter((item) => item.name !== roommate.name))} className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary hover:bg-primary/20">
                      {roommate.name} ×
                    </button>
                   ))}
                 </div>
               )}
             </div>
             <div className="space-y-2">
               <Label htmlFor="roommateReason">Reason (optional)</Label>
               <Textarea id="roommateReason" value={roommateReason} onChange={(event) => setRoommateReason(event.target.value)} placeholder="Add context for the admin" />
             </div>
             <Button className="w-full" onClick={submitRoommateRequest} disabled={createRoommateRequest.isPending || (!removeRoommates.length && !newRoommates.length)}>
               {createRoommateRequest.isPending ? 'Submitting...' : 'Submit for Admin Approval'}
             </Button>
           </div>
         </DialogContent>
       </Dialog>

       <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
          <DialogContent className="sm:max-w-[440px]">
             <DialogHeader>
                <DialogTitle>Request Room Change</DialogTitle>
                <DialogDescription>
                   Your request goes to the hostel admin. Current room: {profile.room_number}
                </DialogDescription>
             </DialogHeader>
             <div className="space-y-4">
                <div className="space-y-2">
                   <Label htmlFor="requestedRoom">Preferred Room</Label>
                   <Input
                      id="requestedRoom"
                      placeholder="e.g. B-202"
                      value={requestedRoom}
                      onChange={(e) => setRequestedRoom(e.target.value)}
                   />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="requestReason">Reason (optional)</Label>
                   <Textarea
                      id="requestReason"
                      placeholder="Why do you need a room change?"
                      rows={3}
                      value={requestReason}
                      onChange={(e) => setRequestReason(e.target.value)}
                   />
                </div>
                <Button
                   className="w-full bg-primary hover:bg-primary/90 rounded-[10px]"
                   disabled={!requestedRoom.trim() || createRequest.isPending}
                   onClick={handleSubmitRoomRequest}
                >
                   {createRequest.isPending ? (
                      <>
                         <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                      </>
                   ) : (
                      'Submit Request'
                   )}
                </Button>
             </div>
          </DialogContent>
       </Dialog>
    </div>
  );

  const renderNoticeBoard = () => (
     <Card className="rounded-[20px] border-none shadow-md bg-white">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-[20px]">
          <CardTitle className="text-xl flex items-center gap-2"><ClipboardList className="text-primary"/> Important Notices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
           {MOCK_NOTICES.map((notice, idx) => (
              <div key={notice.id} className={`p-6 border-b border-slate-100 ${idx === MOCK_NOTICES.length - 1 ? 'border-none' : ''}`}>
                 <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                       {notice.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-500" />}
                       {notice.type === 'info' && <Bell className="w-5 h-5 text-blue-500" />}
                       {notice.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                       {notice.title}
                    </h4>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{notice.date}</span>
                 </div>
                 <p className="text-slate-600 pl-7">{notice.desc}</p>
              </div>
           ))}
        </CardContent>
     </Card>
  );

  const renderMessMenu = () => {
    const todayIdx = todayMenuIndex();
    const today = menu[todayIdx];
    return (
      <div className="space-y-6">
         {/* Today's highlight */}
         <Card className="rounded-[20px] border-none shadow-lg shadow-blue-200/40 bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white overflow-hidden">
            <CardContent className="p-6">
               <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                     <Utensils className="w-5 h-5" /> Today's Menu
                  </h3>
                  <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">{today.day}</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => (
                     <div key={meal} className="bg-white/10 backdrop-blur-sm rounded-[14px] p-4 border border-white/10">
                        <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">
                           {meal} • {MEAL_TIMES[meal]}
                        </p>
                        <p className="font-medium">{today[meal]}</p>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>

         <Card className="rounded-[20px] border-none shadow-md bg-white">
            <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
               <CardTitle className="text-xl flex items-center gap-2"><Utensils className="text-primary"/> Weekly Mess Menu</CardTitle>
               <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Current Week</div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                        <th className="p-4 font-semibold">Day</th>
                        <th className="p-4 font-semibold">Breakfast ({MEAL_TIMES.breakfast})</th>
                        <th className="p-4 font-semibold">Lunch ({MEAL_TIMES.lunch})</th>
                        <th className="p-4 font-semibold">Dinner ({MEAL_TIMES.dinner})</th>
                     </tr>
                  </thead>
                  <tbody className="text-sm">
                     {menu.map((item, idx) => (
                        <tr key={item.day} className={`border-b border-slate-100 transition-colors ${idx === todayIdx ? 'bg-blue-50/70' : 'hover:bg-slate-50/50'}`}>
                           <td className="p-4 font-bold text-slate-800">
                              <span className="inline-flex items-center gap-2">
                                 {item.day}
                                 {idx === todayIdx && (
                                    <span className="text-[10px] font-bold uppercase tracking-wide bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Today</span>
                                 )}
                              </span>
                           </td>
                           <td className="p-4 text-slate-600">{item.breakfast}</td>
                           <td className="p-4 text-slate-600">{item.lunch}</td>
                           <td className="p-4 text-slate-600">{item.dinner}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </CardContent>
         </Card>
      </div>
    );
  };

  const renderProfile = () => (
     <Card className="rounded-[20px] border-none shadow-md bg-white max-w-2xl mx-auto">
        <CardHeader className="border-b border-slate-100 text-center pb-8 pt-10">
           <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg shadow-blue-500/30">
              {profile.full_name.charAt(0)}
           </div>
           <CardTitle className="text-2xl">{profile.full_name}</CardTitle>
           <p className="text-slate-500">{profile.course}</p>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <Label htmlFor="profileName" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</Label>
                 <Input
                    id="profileName"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm(f => ({ ...f, full_name: e.target.value }))}
                    placeholder="Your name"
                 />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="profilePhone" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</Label>
                 <Input
                    id="profilePhone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 9876543210"
                 />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="profileRoom" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Room Number</Label>
                 <Input
                    id="profileRoom"
                    value={profileForm.room_number}
                    onChange={(e) => setProfileForm(f => ({ ...f, room_number: e.target.value }))}
                    placeholder="A-101"
                 />
                 <p className="text-xs text-slate-400">Need a different room? Submit a request from the My Room tab.</p>
              </div>
              <div className="space-y-2">
                 <Label htmlFor="profileEmail" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</Label>
                 <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <span className="font-medium text-slate-700">{profile.email}</span>
                 </div>
              </div>
              <div className="space-y-2">
                 <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Course / Department</Label>
                 <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <BookOpen className="w-5 h-5 text-slate-400" />
                    <span className="font-medium text-slate-700">{profile.course}</span>
                 </div>
              </div>
              <div className="space-y-2">
                 <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Room (live)</Label>
                 <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <Home className="w-5 h-5 text-slate-400" />
                    <span className="font-medium text-slate-700">Room {profile.room_number}</span>
                 </div>
              </div>
           </div>
           <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end gap-3">
              <Button
                 variant="outline"
                 className="rounded-[10px]"
                 onClick={() => setProfileForm({
                    full_name: user?.user_metadata?.full_name ?? '',
                    phone: user?.user_metadata?.phone ?? '',
                    room_number: user?.user_metadata?.room_number ?? '',
                 })}
              >
                 Reset
              </Button>
              <Button
                 className="bg-primary hover:bg-primary/90 rounded-[10px]"
                 onClick={handleSaveProfile}
                 disabled={profileForm.full_name === (user?.user_metadata?.full_name ?? '') &&
                           profileForm.phone === (user?.user_metadata?.phone ?? '') &&
                           profileForm.room_number === (user?.user_metadata?.room_number ?? '')}
              >
                 Save Changes
              </Button>
           </div>
        </CardContent>
     </Card>
  );

  const renderContent = () => {
     switch(activeTab) {
        case 'dashboard': return renderDashboard();
        case 'room': return renderRoom();
        case 'complaints': return renderComplaints();
        case 'noticeboard': return renderNoticeBoard();
        case 'messmenu': return renderMessMenu();
        case 'profile': return renderProfile();
        default: return renderDashboard();
     }
  };

  return (
    <div className="min-h-screen bg-background flex font-sans">
      <aside className="w-64 bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] fixed h-full z-20 hidden md:flex flex-col shadow-2xl">
        <div className="border-b border-[hsl(var(--sidebar-foreground)/0.16)] p-6">
          <button type="button" onClick={() => navigate('/')} className="flex items-center gap-3 text-left" aria-label="Go to HostelCare home">
            <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary shadow-lg shadow-primary/40">
              <Home className="h-5 w-5 text-white" />
            </span>
            <span className="text-xl font-bold tracking-wide">HostelCare</span>
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] font-medium transition-all ${
                activeTab === item.id 
                  ? 'bg-secondary/80 text-[hsl(var(--sidebar-foreground))] shadow-sm'
                  : 'text-[hsl(var(--sidebar-foreground)/0.72)] hover:text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))]'
              }`}
            >
              <item.icon className="w-5 h-5" /> {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[hsl(var(--sidebar-foreground)/0.16)]">
          <Button variant="ghost" className="w-full justify-start text-[hsl(var(--sidebar-foreground)/0.72)] hover:text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] rounded-[12px] h-12" onClick={handleSignOut}>
            <LogOut className="w-5 h-5 mr-3" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 w-full flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-10 px-8 flex items-center justify-between shadow-sm shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
               {activeTab === 'dashboard' ? `Welcome back, ${profile.full_name.split(' ')[0]} 👋` : navItems.find(n => n.id === activeTab)?.label}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
               {activeTab === 'dashboard' ? `Room ${profile.room_number} • Let's check what's happening` : `Viewing your ${navItems.find(n => n.id === activeTab)?.label.toLowerCase()} details`}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search complaints..."
                className="pl-10 bg-slate-100 border-none rounded-[12px] h-11 focus-visible:ring-[#2563EB]"
                value={searchTerm}
                onChange={(e) => {
                  if (!searchTerm && activeTab !== 'complaints') setActiveTab('complaints');
                  setSearchTerm(e.target.value);
                }}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-400 hover:text-[#0F172A] transition-colors" onClick={() => setActiveTab('noticeboard')}>
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#10B981] rounded-full border-2 border-white"></span>
              </button>
              <div 
                className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#2563EB] to-purple-400 p-[2px] cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setActiveTab('profile')}
              >
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <span className="font-bold text-[#2563EB]">{profile.full_name.charAt(0)}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 max-w-7xl mx-auto w-full flex-1">
          {renderContent()}
        </div>
      </main>

      {/* Modals */}
      {isFormOpen && (
        <ComplaintForm
          defaultRoomNumber={profile.room_number}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
        />
      )}

      {selectedComplaint && (
        <ComplaintDetail
          complaint={selectedComplaint}
          open={!!selectedComplaint}
          onOpenChange={(open) => !open && setSelectedComplaint(null)}
        />
      )}
    </div>
  );
}
