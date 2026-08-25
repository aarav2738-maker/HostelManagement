import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Building2, Users, FileText, ClipboardList, 
  MessageSquare, Bell, BarChart, ShieldCheck, 
  Clock, Monitor, Zap, ArrowRight, Lock, Mail,
  ChevronRight, Sparkles, CheckCircle2
} from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Index() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('student');
  const [scrolled, setScrolled] = useState(false);
  const { signIn } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success('Welcome back!');
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    }
  };

  const features = [
    { icon: Building2, title: "Smart Room Allocation", desc: "Automated, conflict-free room assignments based on preferences and availability." },
    { icon: Zap, title: "Instant Issue Resolution", desc: "A streamlined ticketing system for maintenance and complaints with real-time tracking." },
    { icon: FileText, title: "Seamless Fee Management", desc: "Automated invoicing, payment reminders, and transparent digital receipts." },
    { icon: ShieldCheck, title: "Advanced Security", desc: "Digital visitor logs and strict role-based access control for absolute safety." },
    { icon: ClipboardList, title: "Digital Attendance", desc: "Say goodbye to paper registers. Quick, biometric-ready daily attendance tracking." },
    { icon: BarChart, title: "Actionable Analytics", desc: "Comprehensive reports on occupancy, revenue, and student satisfaction metrics." }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans selection:bg-blue-900 selection:text-blue-100 overflow-x-hidden">
      
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10 shadow-sm py-4' : 'bg-transparent py-6'}`}
      >
        <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/10">
              <Building2 className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">HostelCare</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#about" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">About</a>
            <a href="#contact" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden md:inline-flex text-slate-400 font-medium hover:bg-white/5 hover:text-white">
              Support
            </Button>
            <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-900/40 rounded-full px-6 font-medium border-none">
              Login Now
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-blue-900/20 blur-3xl opacity-70"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-slate-800/20 blur-3xl opacity-70"></div>
        </div>

        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            
            {/* Hero Typography */}
            <motion.div 
              className="flex-1 text-center lg:text-left z-10"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold tracking-wide mb-6">
                <Sparkles className="w-4 h-4" />
                <span>The Future of Hostel Management</span>
              </motion.div>
              
              <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.05] mb-6">
                Smart Hostel <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Management System</span>
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                A premium, all-in-one platform designed to automate operations, resolve complaints instantly, and elevate the student living experience.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button onClick={() => navigate('/signup')} className="w-full sm:w-auto h-14 px-8 text-base bg-white hover:bg-slate-200 text-black rounded-full shadow-xl shadow-black/50 transition-all border-none">
                  Request a Demo <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} variant="outline" className="w-full sm:w-auto h-14 px-8 text-base border-white/20 text-slate-300 hover:bg-white/10 hover:text-white rounded-full transition-all bg-transparent">
                  Explore Features
                </Button>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="mt-10 flex items-center justify-center lg:justify-start gap-8 text-sm font-medium text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>ISO Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>99.9% Uptime</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Premium Login Card */}
            <motion.div 
              className="w-full max-w-[440px] z-10"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            >
              <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden p-8">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Access Portal</h3>
                  <p className="text-slate-400 text-sm">Securely log in to manage your workspace.</p>
                </div>

                <Tabs defaultValue="student" onValueChange={(val) => setRole(val)} className="mb-8">
                  <TabsList className="w-full grid grid-cols-2 bg-white/5 p-1 rounded-xl h-12">
                    <TabsTrigger value="student" className="rounded-lg text-sm font-semibold data-[state=active]:bg-[#2A2A2A] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all h-full text-slate-400 border-none">
                      Student
                    </TabsTrigger>
                    <TabsTrigger value="admin" className="rounded-lg text-sm font-semibold data-[state=active]:bg-[#2A2A2A] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all h-full text-slate-400 border-none">
                      Administrator
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-500" />
                      </div>
                      <Input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11 h-12 bg-white/5 border-white/10 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl transition-all shadow-sm"
                        placeholder="hello@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-300">Password</label>
                      <a href="#" className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-500" />
                      </div>
                      <Input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-11 h-12 bg-white/5 border-white/10 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl transition-all shadow-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl mt-4 shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center gap-2 group border-none"
                  >
                    {loading ? "Authenticating..." : "Sign In"}
                    {!loading && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  </Button>
                </form>

                <div className="mt-8 text-center border-t border-white/10 pt-6">
                  <p className="text-sm text-slate-400">
                    Don't have an account? <Link to="/signup" className="font-semibold text-white hover:text-blue-400 transition-colors">Create one now</Link>
                  </p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-10 border-y border-white/10 bg-black">
        <div className="container mx-auto px-6 max-w-7xl">
          <p className="text-center text-sm font-medium text-slate-500 mb-6 uppercase tracking-widest">Trusted by leading institutions</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
             <span className="text-2xl font-bold text-white font-serif">Stanford</span>
             <span className="text-2xl font-bold text-white font-sans tracking-tighter">MIT</span>
             <span className="text-2xl font-bold text-white font-serif italic">Oxford</span>
             <span className="text-2xl font-extrabold text-white font-sans">HARVARD</span>
             <span className="text-2xl font-semibold text-white font-mono">Berkeley</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-[#0A0A0A]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Everything you need to run a world-class facility.</h2>
            <p className="text-lg text-slate-400">Powerful tools designed specifically for modern hostel administration, bringing efficiency to every corner of your operations.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-[#121212] border border-white/5 rounded-3xl p-8 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:border-blue-500/30 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-colors">
                  <feature.icon className="w-6 h-6 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-black -z-20"></div>
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
        
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Ready to modernize your hostel?</h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">Join hundreds of institutions that have already transformed their student living experience with our platform.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button onClick={() => navigate('/signup')} className="w-full sm:w-auto h-14 px-8 text-base bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-900/50 transition-all border-none">
              Get Started for Free
            </Button>
            <Button onClick={() => toast.success("Thanks for your interest! Our sales team will reach out to you shortly.")} variant="outline" className="w-full sm:w-auto h-14 px-8 text-base border-white/20 text-white hover:bg-white/10 rounded-full transition-all bg-transparent">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-black border-t border-white/10 py-12">
        <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-white" />
            <span className="text-lg font-bold text-white tracking-tight">HostelCare</span>
          </div>
          <div className="text-sm text-slate-500">
            © 2026 HostelCare Systems Inc. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
