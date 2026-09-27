import { useEffect, useRef, useState } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BedDouble,
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Eye,
  EyeOff,
  FileText,
  Github,
  Linkedin,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Twitter,
  UserPlus,
} from 'lucide-react';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const stagger: Variants = {
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="mx-auto mb-14 max-w-2xl text-center">
      <Reveal>
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-blue-300">
          {eyebrow}
        </span>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-white md:text-[2.6rem] md:leading-[1.15]">
          {title}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.1}>
          <p className="mt-4 text-lg leading-relaxed text-slate-400">{sub}</p>
        </Reveal>
      )}
    </div>
  );
}

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Reviews', href: '#reviews' },
];

function Navbar({ onLogin }: { onLogin: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="mx-auto max-w-6xl px-4">
        <nav
          className={`flex items-center justify-between gap-4 rounded-2xl px-5 py-3 transition-all duration-300 ${
            scrolled
              ? 'border border-border/70 bg-background/85 shadow-xl shadow-primary/10 backdrop-blur-xl'
              : 'border border-transparent'
          }`}
        >
          <a href="/" className="flex items-center gap-2.5" aria-label="Go to HostelCare home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30">
              <Building2 className="h-[18px] w-[18px] text-primary-foreground" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-foreground">HostelCare</span>
          </a>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/15 hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <button
                type="button"
                onClick={async () => { await signOut(); navigate('/'); }}
                className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                Logout
              </button>
            ) : (
              <button
                type="button"
                onClick={onLogin}
                className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                Login
              </button>
            )}
            <Button
              asChild
              className="h-9 rounded-full bg-gradient-to-r from-primary to-secondary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:brightness-110"
            >
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </nav>
      </div>
    </motion.header>
  );
}

function LoginCard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthContext();
  const navigate = useNavigate();

  const handleRoleChange = (val: string) => {
    setRole(val);
    if (val === 'admin') {
      setEmail('admin@hostel.com');
      setPassword('admin123');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await signIn(email, password);

    if (error || !data) {
      toast.error(error?.message ?? 'Sign in failed. Please try again.');
      setLoading(false);
    } else {
      toast.success('Welcome back!');
      navigate(data.role === 'admin' ? '/admin' : '/dashboard');
    }
  };

  return (
    <div className="rounded-[26px] bg-gradient-to-b from-secondary/25 via-card to-card p-px shadow-xl shadow-primary/15">
        <div className="rounded-[25px] bg-card p-8">
          <div className="mb-7">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">Access Portal</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your workspace — or try the live demo.
            </p>
          </div>

          <Tabs
            defaultValue="student"
            onValueChange={handleRoleChange}
            className="mb-6"
          >
            <TabsList className="grid h-12 w-full grid-cols-2 rounded-xl border border-border bg-background/60 p-1">
              <TabsTrigger
                value="student"
                className="h-full rounded-lg border-none text-sm font-semibold text-muted-foreground transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Student
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="h-full rounded-lg border-none text-sm font-semibold text-muted-foreground transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Administrator
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {role === 'admin' && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-secondary/30 bg-secondary/10 px-3.5 py-2.5 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              Demo admin pre-filled — just press Sign In.
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="hero-email" className="text-sm font-medium text-foreground">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="hero-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl border-border bg-background/60 pl-11 text-foreground shadow-sm transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
                  placeholder="hello@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="hero-password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs font-medium text-primary transition-colors hover:text-secondary"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="hero-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-border bg-background/60 pl-11 pr-11 text-foreground shadow-sm transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="group mt-1 flex h-12 w-full items-center justify-center gap-1.5 rounded-xl border-none bg-gradient-to-r from-primary to-secondary text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:brightness-110"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authenticating…
                </>
              ) : (
                <>
                  Sign In
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-7 border-t border-border pt-5 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-semibold text-primary transition-colors hover:text-secondary"
              >
                Create one now
              </Link>
            </p>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Protected by role-based access control
            </p>
          </div>
        </div>
    </div>
  );
}

const AVATAR_GRADS = [
  'from-primary to-secondary',
  'from-accent to-primary',
  'from-secondary to-primary',
  'from-primary to-accent',
];

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden pb-24 pt-36 md:pb-32 md:pt-44">
      {/* Backdrop: grid, aurora, grain */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0 bg-grid"
          style={{
            maskImage:
              'radial-gradient(ellipse 90% 65% at 50% 30%, black 25%, transparent 78%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 90% 65% at 50% 30%, black 25%, transparent 78%)',
          }}
        />
        <div className="absolute -top-44 left-1/2 h-[560px] w-[920px] -translate-x-1/2 animate-drift rounded-full bg-secondary/20 blur-[140px]" />
        <div className="absolute -left-44 top-48 h-[420px] w-[420px] animate-drift-slow rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute -right-36 top-72 h-[380px] w-[380px] animate-drift rounded-full bg-primary/10 blur-[110px]" />
        <div className="absolute inset-0 bg-grain opacity-[0.16]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 xl:gap-20">
          {/* Copy */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="text-center lg:text-left"
          >
            <motion.div variants={item} className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 py-1.5 pl-3 pr-4 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Made for students, wardens and hostel staff
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="mt-6 text-5xl font-extrabold leading-[1.06] tracking-tight text-foreground sm:text-6xl xl:text-[4.4rem]"
            >
              Smart Hostel
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Management,{' '}
                <span className="font-display font-normal italic">Reimagined.</span>
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0 md:text-xl"
            >
              HostelCare unifies complaints, notices, mess menus, attendance and
              analytics into one beautifully calm platform — built for students,
              loved by wardens.
            </motion.p>

            <motion.div
              variants={item}
              className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:items-start"
            >
              <Button
                onClick={() => navigate('/signup')}
                className="h-[52px] w-full rounded-full border-none bg-gradient-to-r from-primary to-secondary px-8 text-[15px] font-semibold text-primary-foreground shadow-xl shadow-primary/30 transition-all hover:brightness-110 sm:w-auto"
              >
                Get Started Free
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="h-[52px] w-full rounded-full border-border bg-card/50 px-8 text-[15px] font-medium text-foreground backdrop-blur transition-all hover:bg-accent/15 sm:w-auto"
              >
                Explore Features
              </Button>
            </motion.div>

            <motion.div
              variants={item}
              className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 lg:justify-start"
            >
              <div className="flex -space-x-2.5">
                {['AM', 'RS', 'PK', 'JT'].map((ini, i) => (
                  <span
                    key={ini}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#04070E] bg-gradient-to-br text-[11px] font-bold text-white ${AVATAR_GRADS[i % AVATAR_GRADS.length]}`}
                  >
                    {ini}
                  </span>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1.5 text-sm font-semibold text-white">4.9</span>
                </div>
                <p className="mt-0.5 text-sm text-slate-400">
                  Loved by <span className="font-semibold text-white">12,000+</span> students &amp; staff
                </p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
            className="relative mx-auto w-full max-w-lg"
          >
            <div className="absolute -right-5 -top-5 h-28 w-28 rounded-full bg-secondary/20 blur-3xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[28px] border border-border bg-card/85 p-5 shadow-2xl shadow-primary/15 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-border pb-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground">Hostel overview</p>
                    <p className="text-xs text-muted-foreground">Tuesday, 23 September</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-accent/20 px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Live
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 py-5">
                {[
                  { label: 'Open issues', value: '08', icon: ClipboardList, tone: 'bg-primary/10 text-primary' },
                  { label: 'Resolved', value: '94%', icon: CheckCircle2, tone: 'bg-accent/20 text-accent-foreground' },
                  { label: 'Occupancy', value: '87%', icon: BedDouble, tone: 'bg-secondary/15 text-primary' },
                ].map(({ label, value, icon: Icon, tone }) => (
                  <div key={label} className="rounded-2xl border border-border/70 bg-background/70 p-3">
                    <span className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <p className="text-xl font-extrabold tracking-tight text-foreground">{value}</p>
                    <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/55 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-bold text-foreground">Recent activity</p>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-3">
                  {[
                    ['Water supply issue', 'Resolved in Block B', '2m ago'],
                    ['Room C-204 allocated', 'New room request approved', '18m ago'],
                    ['Mess menu updated', 'Wednesday dinner changed', '1h ago'],
                  ].map(([title, detail, time]) => (
                    <div key={title} className="flex items-center gap-3">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-secondary" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-foreground">{title}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{detail}</p>
                      </div>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const HOSTELS = [
  { name: 'Ashoka Residency', cls: 'font-display italic' },
  { name: 'Sunrise Hostels', cls: 'font-sans tracking-tighter' },
  { name: 'Green Valley PG', cls: 'font-display' },
  { name: 'OAKVIEW', cls: 'font-sans font-extrabold tracking-wide' },
  { name: 'Riverside Hostel', cls: 'font-mono font-semibold' },
  { name: 'Nalanda Bhawan', cls: 'font-sans font-extrabold' },
  { name: 'Palm Grove', cls: 'font-display italic' },
  { name: 'KASTURI', cls: 'font-sans tracking-widest' },
];

function LogoMarquee() {
  return (
    <section className="border-y border-white/5 bg-white/[0.02] py-10">
      <p className="mb-8 text-center text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">
        Running day-to-day in hostels like
      </p>
      <div className="marquee-mask overflow-hidden">
        <div className="flex w-max animate-marquee items-center">
          {[...HOSTELS, ...HOSTELS].map((inst, i) => (
            <span
              key={`${inst.name}-${i}`}
              className={`mx-10 whitespace-nowrap text-2xl text-slate-500 transition-colors hover:text-slate-300 ${inst.cls}`}
            >
              {inst.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Counter({
  to,
  suffix = '',
  decimals = 0,
}: {
  to: number;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const t0 = performance.now();
    const dur = 1800;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min((t - t0) / dur, 1);
      setVal(to * (1 - Math.pow(1 - p, 4)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  return (
    <span ref={ref} className="tabular-nums">
      {val.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

const STATS = [
  { to: 12500, suffix: '+', decimals: 0, label: 'Active students' },
  { to: 98, suffix: '%', decimals: 0, label: 'Complaints resolved on time' },
  { to: 150, suffix: '+', decimals: 0, label: 'Hostels onboard' },
  { to: 4.9, suffix: '/5', decimals: 1, label: 'Average satisfaction' },
];

function Stats() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-card px-6 py-10 text-center">
                <p className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                  <Counter to={s.to} suffix={s.suffix} decimals={s.decimals} />
                </p>
                <p className="mt-2 text-sm font-medium text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const FEATURE_CARD =
  'group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition-all duration-300 hover:border-blue-400/30 hover:bg-white/[0.05]';

const FEATURE_GLOW =
  'pointer-events-none absolute -top-24 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100';

const OCCUPIED_ROOMS = new Set([2, 5, 9, 14, 17, 23, 27, 30]);

function IconChip({
  icon: Icon,
  className = 'border-blue-400/20 bg-blue-500/10 text-blue-300',
}: {
  icon: React.ElementType;
  className?: string;
}) {
  return (
    <span
      className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${className}`}
    >
      <Icon className="h-5 w-5" />
    </span>
  );
}

function Features() {
  return (
    <section id="features" className="py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="Features"
          title={
            <>
              Everything you need to run a{' '}
              <span className="font-display font-normal italic text-blue-300">world-class</span>{' '}
              facility.
            </>
          }
          sub="Powerful tools designed for modern hostel administration — bringing calm, clarity and speed to every corner of your operations."
        />

        <div className="grid gap-5 lg:grid-cols-6">
          {/* Smart Room Allocation */}
          <Reveal className="lg:col-span-3">
            <div className={FEATURE_CARD}>
              <div className={FEATURE_GLOW} />
              <IconChip icon={BedDouble} />
              <h3 className="text-xl font-bold tracking-tight text-white">
                Smart Room Allocation
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Automated, conflict-free room assignments that respect preferences,
                batch-mates and availability — no spreadsheets, no clashes.
              </p>
              <div className="mt-6 grid grid-cols-8 gap-1.5">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-5 rounded-[5px] transition-colors ${
                      OCCUPIED_ROOMS.has(i)
                        ? 'bg-gradient-to-br from-primary to-secondary shadow-sm shadow-primary/40'
                        : 'border border-white/10 bg-white/5'
                    }`}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  142 of 150 rooms occupied
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-medium text-slate-300">
                  Auto-assigned
                </span>
              </div>
            </div>
          </Reveal>

          {/* Complaint resolution */}
          <Reveal delay={0.08} className="lg:col-span-3">
            <div className={FEATURE_CARD}>
              <div className={FEATURE_GLOW} />
              <IconChip icon={MessageSquare} />
              <h3 className="text-xl font-bold tracking-tight text-white">
                Instant Issue Resolution
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                A streamlined ticketing system for maintenance and complaints —
                students track every update in real time, wardens close tickets faster.
              </p>
              <div className="mt-6 space-y-2.5">
                {[
                  { label: 'WiFi down — Block B', status: 'Resolved', cls: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300' },
                  { label: 'Leaking tap — Room 214', status: 'In progress', cls: 'border-blue-400/20 bg-blue-500/10 text-blue-300' },
                  { label: 'Mess feedback — Week 12', status: 'Pending', cls: 'border-amber-400/20 bg-amber-500/10 text-amber-300' },
                ].map((t) => (
                  <div
                    key={t.label}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5"
                  >
                    <span className="truncate text-sm text-slate-300">{t.label}</span>
                    <span className={`ml-3 shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${t.cls}`}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Fees */}
          <Reveal className="lg:col-span-2">
            <div className={FEATURE_CARD}>
              <div className={FEATURE_GLOW} />
              <IconChip icon={FileText} className="border-emerald-400/20 bg-emerald-500/10 text-emerald-300" />
              <h3 className="text-xl font-bold tracking-tight text-white">Seamless Fee Management</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Automated invoicing, payment reminders and transparent digital receipts.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {['Auto receipts', 'Reminders', 'Ledger'].map((chip) => (
                  <span key={chip} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Attendance */}
          <Reveal delay={0.08} className="lg:col-span-2">
            <div className={FEATURE_CARD}>
              <div className={FEATURE_GLOW} />
              <IconChip icon={ClipboardList} className="border-violet-400/20 bg-violet-500/10 text-violet-300" />
              <h3 className="text-xl font-bold tracking-tight text-white">Digital Attendance</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Goodbye paper registers. One-tap daily tracking, biometric-ready.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {['One tap', 'Live headcount', 'Reports'].map((chip) => (
                  <span key={chip} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Security */}
          <Reveal delay={0.16} className="lg:col-span-2">
            <div className={FEATURE_CARD}>
              <div className={FEATURE_GLOW} />
              <IconChip icon={ShieldCheck} className="border-rose-400/20 bg-rose-500/10 text-rose-300" />
              <h3 className="text-xl font-bold tracking-tight text-white">Advanced Security</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Digital visitor logs and strict role-based access for absolute safety.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {['Visitor logs', 'RBAC', 'Audit trail'].map((chip) => (
                  <span key={chip} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Analytics — full width */}
          <Reveal className="lg:col-span-6">
            <div className={`${FEATURE_CARD} flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between`}>
              <div className={FEATURE_GLOW} />
              <div className="max-w-md">
                <IconChip icon={BarChart3} className="border-sky-400/20 bg-sky-500/10 text-sky-300" />
                <h3 className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white">
                  Actionable Analytics
                  <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    Live
                  </span>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Comprehensive reports on occupancy, revenue and student satisfaction —
                  spot trends before they become problems.
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="text-4xl font-extrabold tracking-tight text-white">98%</span>
                  <span className="flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                    <TrendingUp className="h-3.5 w-3.5" />
                    resolution rate
                  </span>
                </div>
              </div>
              <div className="w-full max-w-xl">
                <div className="flex h-40 items-end gap-2 md:h-44">
                  {[35, 48, 42, 60, 55, 72, 66, 84, 78, 92, 88, 100].map((h, i) => (
                    <div
                      key={i}
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        i >= 9
                          ? 'bg-gradient-to-t from-primary to-secondary shadow-lg shadow-primary/20'
                          : 'bg-gradient-to-t from-primary/30 to-secondary/40 group-hover:from-primary/40 group-hover:to-secondary/55'
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-[11px] font-medium uppercase tracking-wider text-slate-500">
                  <span>Jan</span>
                  <span>Apr</span>
                  <span>Aug</span>
                  <span>Dec</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    num: '01',
    icon: UserPlus,
    title: 'Create your account',
    desc: 'Students sign up with their room details in under a minute; administrators get a full control panel from day one.',
  },
  {
    num: '02',
    icon: Bell,
    title: 'Raise & track requests',
    desc: 'Log complaints, notices and mess feedback in seconds — every status update lands in your feed instantly.',
  },
  {
    num: '03',
    icon: BadgeCheck,
    title: 'Resolved, reviewed, improved',
    desc: 'Track every ticket to closure and watch satisfaction metrics climb week after week.',
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="How it works"
          title={
            <>
              From signup to{' '}
              <span className="font-display font-normal italic text-blue-300">solved</span> —
              in three steps.
            </>
          }
        />

        <div className="relative grid gap-5 md:grid-cols-3">
          {/* Connector */}
          <div
            aria-hidden
            className="absolute left-[16%] right-[16%] top-14 hidden border-t-2 border-dashed border-white/10 md:block"
          />
          {STEPS.map((step, i) => (
            <Reveal key={step.num} delay={i * 0.1}>
              <div className={`${FEATURE_CARD} text-center`}>
                <div className={FEATURE_GLOW} />
                <div className="relative mx-auto mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.03] shadow-lg shadow-black/30">
                  <step.icon className="h-7 w-7 text-blue-300" />
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-[11px] font-bold text-primary-foreground shadow-md shadow-primary/40">
                    {i + 1}
                  </span>
                </div>
                <p className="font-display text-lg italic text-slate-500">{step.num}</p>
                <h3 className="mt-1 text-lg font-bold tracking-tight text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  {
    quote:
      'HostelCare cut our complaint turnaround from days to hours. The warden dashboard is the single screen I run my whole day from.',
    name: 'Dr. Meera Krishnan',
    role: 'Chief Warden · Blocks A–D',
    initials: 'MK',
    grad: 'from-primary to-secondary',
  },
  {
    quote:
      'Raised a WiFi complaint at midnight — fixed before breakfast. The live status updates are honestly addictive.',
    name: 'Arjun Mehta',
    role: 'Student · Room C-204',
    initials: 'AM',
    grad: 'from-emerald-500 to-teal-500',
  },
  {
    quote:
      'Fee receipts, attendance, visitor logs — everything finally lives in one place. Audit prep went from a week to an afternoon.',
    name: 'Ritu Bansal',
    role: 'Hostel Administrator',
    initials: 'RB',
    grad: 'from-amber-500 to-orange-500',
  },
];

function Testimonials() {
  return (
    <section id="reviews" className="py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="Reviews"
          title={
            <>
              Loved by the people who{' '}
              <span className="font-display font-normal italic text-blue-300">run</span> hostels.
            </>
          }
          sub="Wardens, administrators and students — hear it from the people using HostelCare every single day."
        />

        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <figure className={`${FEATURE_CARD} flex h-full flex-col`}>
                <div className={FEATURE_GLOW} />
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-slate-300">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${t.grad}`}
                  >
                    {t.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  const navigate = useNavigate();

  return (
    <section id="contact" className="py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-gradient-to-b from-secondary/20 via-card to-card px-6 py-16 text-center shadow-xl shadow-primary/10 md:py-24">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[560px] -translate-x-1/2 rounded-full bg-secondary/20 blur-[110px]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/70 to-transparent"
            />

            <h2 className="relative mx-auto max-w-2xl text-4xl font-extrabold tracking-tight text-foreground md:text-5xl md:leading-[1.12]">
              Ready to transform{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text font-display font-normal italic text-transparent">
                your hostel?
              </span>
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Join hundreds of institutions already delivering a calmer, faster and
              smarter living experience for their students.
            </p>
            <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                onClick={() => navigate('/signup')}
                className="h-[52px] w-full rounded-full border-none bg-gradient-to-r from-primary to-secondary px-8 text-[15px] font-semibold text-primary-foreground shadow-xl shadow-primary/30 transition-all hover:brightness-110 sm:w-auto"
              >
                Get Started Free
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast.success('Thanks for your interest! Our team will reach out shortly.')
                }
                className="h-[52px] w-full rounded-full border-border bg-background/60 px-8 text-[15px] font-medium text-foreground backdrop-blur transition-all hover:bg-accent/15 sm:w-auto"
              >
                Talk to Us
              </Button>
            </div>
            <p className="relative mt-6 text-sm text-muted-foreground">
              Free to try · No credit card required · Set up in minutes
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const FOOTER_COLS = [
  { title: 'Product', links: ['Features', 'Live demo', 'Pricing', 'Changelog'] },
  { title: 'Company', links: ['About', 'Careers', 'Press', 'Contact'] },
  { title: 'Resources', links: ['Help center', 'Community', 'Privacy', 'Terms'] },
];

function Footer() {
  return (
    <footer className="border-t border-border bg-[hsl(var(--sidebar-background))] py-16 text-[hsl(var(--sidebar-foreground))]">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <a href="/" className="flex items-center gap-2.5" aria-label="Go to HostelCare home">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30">
                <Building2 className="h-[18px] w-[18px] text-primary-foreground" />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-[hsl(var(--sidebar-foreground))]">HostelCare</span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[hsl(var(--sidebar-foreground)/0.72)]">
              The all-in-one platform for modern hostel management — complaints,
              notices, mess, attendance and analytics in one calm place.
            </p>
            <div className="mt-6 flex gap-2.5">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label={['Twitter', 'GitHub', 'LinkedIn'][i]}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[hsl(var(--sidebar-foreground)/0.22)] text-[hsl(var(--sidebar-foreground)/0.72)] transition-all hover:border-[hsl(var(--sidebar-foreground)/0.5)] hover:text-[hsl(var(--sidebar-foreground))]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--sidebar-foreground))]">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-[hsl(var(--sidebar-foreground)/0.72)] transition-colors hover:text-[hsl(var(--sidebar-foreground))]">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-[hsl(var(--sidebar-foreground)/0.18)] pt-8 text-sm text-[hsl(var(--sidebar-foreground)/0.72)] md:flex-row">
          <p>© 2026 HostelCare. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            Built for modern campus living
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Index() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div className="landing-light min-h-screen overflow-x-hidden bg-background font-sans text-foreground selection:bg-primary/30 selection:text-primary-foreground">
      <Navbar onLogin={() => setLoginOpen(true)} />
      <main>
        <Hero />
        <LogoMarquee />
        <Stats />
        <Features />
        <HowItWorks />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-background p-3 sm:max-w-lg">
          <DialogTitle className="sr-only">Sign in to HostelCare</DialogTitle>
          <DialogDescription className="sr-only">Enter your HostelCare account credentials.</DialogDescription>
          <LoginCard />
        </DialogContent>
      </Dialog>
    </div>
  );
}
