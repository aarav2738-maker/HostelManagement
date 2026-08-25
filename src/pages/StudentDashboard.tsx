import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useComplaints } from '@/hooks/useComplaints';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Plus, Clock, CheckCircle2, Search, Bell, Home, LayoutDashboard, MessageSquare, ClipboardList, Utensils, User, Phone, Mail, BookOpen, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ComplaintForm from '@/components/ComplaintForm';
import { ComplaintCard } from '@/components/ComplaintCard';
import { ComplaintDetail } from '@/components/ComplaintDetail';
import { Database } from '@/integrations/supabase/types';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type Complaint = Database['public']['Tables']['complaints']['Row'];

// --- MOCK DATA ---
const MOCK_NOTICES = [
  { id: 1, title: 'Hostel Maintenance Drive', date: '2026-08-15', desc: 'Routine maintenance of electrical appliances will be conducted this weekend.', type: 'info' },
  { id: 2, title: 'Mess Fee Due Date', date: '2026-08-20', desc: 'Please clear your mess dues for this month before the 20th to avoid late fees.', type: 'warning' },
  { id: 3, title: 'Upcoming Cultural Night', date: '2026-08-25', desc: 'Join us for the annual hostel cultural night in the main courtyard!', type: 'success' },
];

const MOCK_MESS_MENU = [
  { day: 'Monday', breakfast: 'Idli Sambar', lunch: 'Rajma Chawal, Roti, Salad', dinner: 'Dal Makhani, Mix Veg, Roti' },
  { day: 'Tuesday', breakfast: 'Poha, Jalebi', lunch: 'Kadi Pakora, Rice, Roti', dinner: 'Paneer Butter Masala, Roti, Dessert' },
  { day: 'Wednesday', breakfast: 'Aloo Paratha, Curd', lunch: 'Chole Bhature, Rice', dinner: 'Egg Curry / Soyabean, Roti' },
  { day: 'Thursday', breakfast: 'Upma, Chutney', lunch: 'Dal Fry, Jeera Rice, Bhindi', dinner: 'Chicken Curry / Malai Kofta, Roti' },
  { day: 'Friday', breakfast: 'Puri Sabji', lunch: 'Veg Biryani, Raita', dinner: 'Dal Tadka, Aloo Gobi, Roti' },
];

const MOCK_ROOMMATES = [
  { name: 'Rahul Sharma', course: 'B.Tech CS', phone: '+91 9876543210' },
  { name: 'Amit Kumar', course: 'B.Tech ECE', phone: '+91 9876543211' }
];

export default function StudentDashboard() {
  const { user, signOut } = useAuthContext();
  const { complaints, isLoading } = useComplaints();
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const profile = {
    full_name: user?.user_metadata?.full_name || 'Alex Student',
    room_number: user?.user_metadata?.room_number || 'A-101',
    course: 'B.Tech Computer Science',
    email: user?.email || 'student@example.com',
    phone: '+91 9998887776'
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const userComplaints = complaints.filter(c => c.user_id === user?.id);
  const pendingCount = userComplaints.filter(c => c.status === 'pending').length;
  const resolvedCount = userComplaints.filter(c => c.status === 'resolved').length;

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
            <LayoutDashboard className="w-16 h-16 text-[#2563EB]" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Complaints</p>
            <div className="text-4xl font-bold text-[#0F172A]">{userComplaints.length}</div>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border-none shadow-lg shadow-slate-200/50 bg-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Clock className="w-16 h-16 text-[#2563EB]" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-semibold text-[#2563EB] uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span> Pending
            </p>
            <div className="text-4xl font-bold text-[#0F172A]">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border-none shadow-lg shadow-slate-200/50 bg-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-16 h-16 text-[#10B981]" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-semibold text-[#10B981] uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span> Resolved
            </p>
            <div className="text-4xl font-bold text-[#0F172A]">{resolvedCount}</div>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border-none shadow-lg shadow-slate-200/50 bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white overflow-hidden relative group cursor-pointer hover:shadow-xl hover:shadow-[#2563EB]/30 transition-all" onClick={() => setIsFormOpen(true)}>
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
           <Button variant="ghost" className="text-[#2563EB]" onClick={() => setActiveTab('complaints')}>View All</Button>
        </div>
        {isLoading ? (
          <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-[#2563EB]/20 border-t-[#2563EB] rounded-full animate-spin"></div></div>
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
         <Button className="bg-[#2563EB] hover:bg-blue-700 rounded-[10px]" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2"/> New Complaint
         </Button>
      </div>
      <Tabs defaultValue="all" className="w-full">
        <div className="px-6 pt-6 border-b border-slate-100 flex items-center justify-between">
          <TabsList className="bg-slate-100/80 p-1 rounded-[12px]">
            <TabsTrigger value="all" className="rounded-[10px] data-[state=active]:bg-white data-[state=active]:text-[#2563EB] data-[state=active]:shadow-sm">All</TabsTrigger>
            <TabsTrigger value="pending" className="rounded-[10px] data-[state=active]:bg-white data-[state=active]:text-[#2563EB] data-[state=active]:shadow-sm">Pending</TabsTrigger>
            <TabsTrigger value="resolved" className="rounded-[10px] data-[state=active]:bg-white data-[state=active]:text-[#2563EB] data-[state=active]:shadow-sm">Resolved</TabsTrigger>
          </TabsList>
        </div>

        <div className="p-6 bg-slate-50/50 min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-4">
              <div className="w-12 h-12 border-4 border-[#2563EB]/20 border-t-[#2563EB] rounded-full animate-spin"></div>
              <p className="font-medium text-sm">Loading complaints...</p>
            </div>
          ) : userComplaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-4 bg-white rounded-[20px] border border-dashed border-slate-200">
              <CheckCircle2 className="w-16 h-16 text-[#10B981]/50" />
              <p className="font-medium">No complaints found. Everything looks good!</p>
            </div>
          ) : (
            <>
              <TabsContent value="all" className="mt-0">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {userComplaints.map(complaint => (
                    <div key={complaint.id} onClick={() => setSelectedComplaint(complaint)}><ComplaintCard complaint={complaint} /></div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="pending" className="mt-0">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {userComplaints.filter(c => c.status === 'pending').map(complaint => (
                    <div key={complaint.id} onClick={() => setSelectedComplaint(complaint)}><ComplaintCard complaint={complaint} /></div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="resolved" className="mt-0">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {userComplaints.filter(c => c.status === 'resolved').map(complaint => (
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
             <CardTitle className="text-xl flex items-center gap-2"><Home className="text-[#2563EB]"/> Room Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col md:flex-row gap-8 items-center md:items-start">
             <div className="w-32 h-32 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                <span className="text-4xl font-extrabold text-[#2563EB]">{profile.room_number}</span>
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
          <Button variant="outline" size="sm" className="text-[#2563EB] border-[#2563EB]/30 hover:bg-[#2563EB]/5" onClick={() => toast.success("Roommate change request submitted to admin.")}>
             Request Change
          </Button>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_ROOMMATES.map((rm, idx) => (
             <Card key={idx} className="rounded-xl border-slate-100 shadow-sm">
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
    </div>
  );

  const renderNoticeBoard = () => (
     <Card className="rounded-[20px] border-none shadow-md bg-white">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-[20px]">
           <CardTitle className="text-xl flex items-center gap-2"><ClipboardList className="text-[#2563EB]"/> Important Notices</CardTitle>
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

  const renderMessMenu = () => (
     <Card className="rounded-[20px] border-none shadow-md bg-white">
        <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
           <CardTitle className="text-xl flex items-center gap-2"><Utensils className="text-[#2563EB]"/> Weekly Mess Menu</CardTitle>
           <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Current Week</div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                    <th className="p-4 font-semibold">Day</th>
                    <th className="p-4 font-semibold">Breakfast (8:00 AM)</th>
                    <th className="p-4 font-semibold">Lunch (1:00 PM)</th>
                    <th className="p-4 font-semibold">Dinner (8:00 PM)</th>
                 </tr>
              </thead>
              <tbody className="text-sm">
                 {MOCK_MESS_MENU.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                       <td className="p-4 font-bold text-slate-800">{item.day}</td>
                       <td className="p-4 text-slate-600">{item.breakfast}</td>
                       <td className="p-4 text-slate-600">{item.lunch}</td>
                       <td className="p-4 text-slate-600">{item.dinner}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </CardContent>
     </Card>
  );

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
                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                 <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <span className="font-medium text-slate-700">{profile.email}</span>
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</label>
                 <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <span className="font-medium text-slate-700">{profile.phone}</span>
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Room Allocated</label>
                 <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <Home className="w-5 h-5 text-slate-400" />
                    <span className="font-medium text-slate-700">Room {profile.room_number}</span>
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Course / Department</label>
                 <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <BookOpen className="w-5 h-5 text-slate-400" />
                    <span className="font-medium text-slate-700">{profile.course}</span>
                 </div>
              </div>
           </div>
           <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
              <Button className="bg-[#2563EB] hover:bg-blue-700 rounded-[10px]">Update Profile Info</Button>
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
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Sidebar - Dark Navy (#0F172A) */}
      <aside className="w-64 bg-[#0F172A] text-white fixed h-full z-20 hidden md:flex flex-col shadow-2xl">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 bg-[#2563EB] rounded-[12px] flex items-center justify-center shadow-lg shadow-[#2563EB]/40">
            <Home className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-wide">HostelCare</h2>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] font-medium transition-all ${
                activeTab === item.id 
                  ? 'bg-[#2563EB]/20 text-[#2563EB]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" /> {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5 rounded-[12px] h-12" onClick={handleSignOut}>
            <LogOut className="w-5 h-5 mr-3" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 w-full flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-10 px-8 flex items-center justify-between shadow-sm shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">
               {activeTab === 'dashboard' ? `Welcome back, ${profile.full_name.split(' ')[0]} 👋` : navItems.find(n => n.id === activeTab)?.label}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
               {activeTab === 'dashboard' ? `Room ${profile.room_number} • Let's check what's happening` : `Viewing your ${navItems.find(n => n.id === activeTab)?.label.toLowerCase()} details`}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input placeholder="Search complaints, notices..." className="pl-10 bg-slate-100 border-none rounded-[12px] h-11 focus-visible:ring-[#2563EB]" />
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
