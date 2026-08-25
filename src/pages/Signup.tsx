import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Building2, Loader2 } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [hostelId, setHostelId] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);

    // Using existing signUp signature, mocking hostelId handling for now
    const { error } = await signUp(email, password, fullName, roomNumber);

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success('Account created successfully!');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2563EB]/20 via-[#F8FAFC] to-[#10B981]/10 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 rounded-[20px] glass">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-[#2563EB] rounded-[20px] flex items-center justify-center mb-4 shadow-lg shadow-[#2563EB]/30">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#0F172A]">Create Account</CardTitle>
          <CardDescription>
            Register to submit and track hostel complaints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                className="rounded-[10px] bg-white/50 focus:bg-white transition-colors"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hostelId">Hostel ID</Label>
                <Input
                  id="hostelId"
                  type="text"
                  className="rounded-[10px] bg-white/50 focus:bg-white transition-colors"
                  placeholder="H-01"
                  value={hostelId}
                  onChange={(e) => setHostelId(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomNumber">Room Number</Label>
                <Input
                  id="roomNumber"
                  type="text"
                  className="rounded-[10px] bg-white/50 focus:bg-white transition-colors"
                  placeholder="A-101"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                className="rounded-[10px] bg-white/50 focus:bg-white transition-colors"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                className="rounded-[10px] bg-white/50 focus:bg-white transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                className="rounded-[10px] bg-white/50 focus:bg-white transition-colors"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full h-12 rounded-[15px] bg-[#2563EB] hover:bg-[#2563EB]/90 text-white text-base shadow-lg shadow-[#2563EB]/30 mt-6" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-[#2563EB] font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
