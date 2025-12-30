import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, UserPlus, Shield, ArrowRight, Mail, Lock, User as UserIcon, CheckCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/services/api";

const registerSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z.string()
    .email("Please enter a valid email address")
    .refine((email) => email.toLowerCase().endsWith('@gmail.com'), "Only Gmail addresses are allowed"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Trigger form animation
    setTimeout(() => setShowForm(true), 300);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);

    try {
      const response = await authAPI.register(
        data.name,
        data.email,
        data.password,
        undefined,
        'user'
      );

      toast({
        title: "OTP Sent!",
        description: "Please check your email for the verification code.",
      });

      // Navigate to OTP verification page with email
      navigate("/verify-otp", { state: { email: response.user.email } });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-success/5 rounded-full blur-[140px]"></div>
      </div>

      {/* Header/Logo */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link to="/" className="flex items-center space-x-3 group w-fit">
            <div className="relative">
              <img src="/Logo.jpg" alt="Logo" className="h-10 w-10 rounded-xl shadow-sm" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              Rent<span className="text-primary">Car</span>
            </span>
          </Link>
        </div>
      </div>

      <div className="w-full max-w-2xl relative z-10 transition-all duration-1000 transform scale-100 py-20">
        {/* Welcome Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Account</span></h1>
          <p className="text-muted-foreground font-medium text-sm">Join our exclusive community of premium mobility enthusiasts.</p>
        </div>

        {/* Register Card */}
        <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-sm">
          <CardContent className="p-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Identity</Label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="name"
                      placeholder="Jane Doe"
                      {...register("name")}
                      className="bg-secondary/30 border-border h-14 pl-12 rounded-2xl focus:border-primary/50 focus:ring-primary/20 transition-all text-sm placeholder:text-muted-foreground"
                    />
                  </div>
                  {errors.name && <p className="text-[10px] text-red-500 font-bold uppercase ml-1">{errors.name.message}</p>}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Authorization</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="email"
                      placeholder="jane@gmail.com"
                      {...register("email")}
                      className="bg-secondary/30 border-border h-14 pl-12 rounded-2xl focus:border-primary/50 focus:ring-primary/20 transition-all text-sm placeholder:text-muted-foreground"
                    />
                  </div>
                  {errors.email && <p className="text-[10px] text-red-500 font-bold uppercase ml-1">{errors.email.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Secret Key</Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("password")}
                      className="bg-secondary/30 border-border h-14 pl-12 pr-12 rounded-2xl focus:border-primary/50 focus:ring-primary/20 transition-all text-sm placeholder:text-muted-foreground"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                  {errors.password && <p className="text-[10px] text-red-500 font-bold uppercase ml-1">{errors.password.message}</p>}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Verify Key</Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      {...register("confirmPassword")}
                      className="bg-secondary/30 border-border h-14 pl-12 rounded-2xl focus:border-primary/50 focus:ring-primary/20 transition-all text-sm placeholder:text-muted-foreground"
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold uppercase ml-1">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-secondary/30 border border-border space-y-4">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center">
                  <CheckCircle className="h-3.5 w-3.5 mr-2 text-primary" /> Security Standards
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {['8+ Characters', 'Uppercase', 'Numeric', 'Special Char'].map((req, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/50"></div>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-sm shadow-sm transition-all group active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center">
                    Initialize Onboarding <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-10 pt-8 border-t border-border text-center">
              <p className="text-muted-foreground text-sm font-medium">
                Already registered?{" "}
                <Link to="/login" className="text-primary font-bold hover:text-primary/80 transition-colors">Access Account</Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
          &copy; 2025 RentCar Security Protocol. Data Protection Act Compliant.
        </p>
      </div>
    </div>
  );
};

export default Register;
