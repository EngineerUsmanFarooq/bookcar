import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Users, Shield, ArrowRight, Mail, Lock, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Trigger form animation
    setTimeout(() => setShowForm(true), 300);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Attempting login with:', email);
      // Clear any existing user data
      localStorage.removeItem("user");

      const response = await authAPI.login(email, password);
      console.log('Login response:', response);

      if (!response || !response.user) {
        throw new Error('Invalid response from server');
      }

      if (response.user.status !== 'active') {
        throw new Error('Your account is not active. Please contact support.');
      }

      localStorage.setItem("user", JSON.stringify(response.user));

      toast({
        title: `Welcome back${response.user.role === 'admin' ? ', Admin' : ''}!`,
        description: "You have been logged in successfully.",
      });

      if (response.user.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen bg-[#0F0F0F] text-white selection:bg-blue-500/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/5 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/5 rounded-full blur-[140px]"></div>
      </div>

      {/* Header/Logo */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link to="/" className="flex items-center space-x-3 group w-fit">
            <div className="relative">
              <img src="/Logo.jpg" alt="Logo" className="h-10 w-10 rounded-xl shadow-2xl transition-all group-hover:scale-105" />
              <div className="absolute inset-0 bg-blue-500/20 rounded-xl filter blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Rent<span className="text-blue-500">Car</span>
            </span>
          </Link>
        </div>
      </div>

      <div className="w-full max-w-lg relative z-10 transition-all duration-1000 transform scale-100">
        {/* Welcome Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 rounded-full px-4 py-1.5 border border-blue-500/20 mb-6">
            <Shield className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Secure Access</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Back</span></h1>
          <p className="text-gray-500 font-light text-sm">Please enter your credentials to access your mobility workspace.</p>
        </div>

        {/* Login Card */}
        <Card className="bg-[#161616] border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardContent className="p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Authorization</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/5 border-white/5 h-14 pl-12 rounded-2xl focus:border-blue-500/50 focus:ring-blue-500/20 transition-all text-sm placeholder:text-gray-600"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center ml-1">
                  <Label htmlFor="password" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Secret Key</Label>
                  <Link to="/forgot-password" className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">Recover Password</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/5 border-white/5 h-14 pl-12 pr-12 rounded-2xl focus:border-blue-500/50 focus:ring-blue-500/20 transition-all text-sm placeholder:text-gray-600"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20 transition-all group active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center">
                    Establish Session <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-gray-500 text-sm font-light">
                New to the platform?{" "}
                <Link to="/register" className="text-white font-bold hover:text-blue-500 transition-colors">Begin Onboarding</Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-[10px] text-gray-600 uppercase tracking-[0.2em] font-bold">
          &copy; 2025 RentCar Security Protocol. Encrypted Connectivity Verified.
        </p>
      </div>
    </div>
  );
};

export default Login;
