import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Building2, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success('Logged in successfully!');
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
          <CardTitle className="text-2xl font-bold text-[#0F172A]">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your hostel account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="#" className="text-sm text-[#2563EB] hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                className="rounded-[10px] bg-white/50 focus:bg-white transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full h-12 rounded-[15px] bg-[#2563EB] hover:bg-[#2563EB]/90 text-white text-base shadow-lg shadow-[#2563EB]/30 mt-6" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#2563EB] font-semibold hover:underline">
              Create account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
