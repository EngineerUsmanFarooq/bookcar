import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, ArrowLeft, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/services/api";

const resetPasswordSchema = z.object({
  otp: z.string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const email = searchParams.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please go back and enter your email address first.",
        variant: "destructive"
      });
      navigate("/forgot-password");
    }
  }, [email, navigate, toast]);

  const onSubmit = async (data: ResetPasswordForm) => {
    setIsLoading(true);

    try {
      await authAPI.resetPassword(email, data.otp, data.password);

      toast({
        title: "Password Reset Successful!",
        description: "You can now log in with your new password.",
      });

      // Redirect to login page
      navigate("/login");
    } catch (error) {
      toast({
        title: "Password reset failed",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-success/5 rounded-full blur-[140px]"></div>
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <img src="/Logo.jpg" alt="RentCar Logo" className="h-10 w-10 rounded-xl shadow-sm" />
            <span className="text-2xl font-bold text-foreground">Rent<span className="text-primary">Car</span></span>
          </Link>
        </div>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Reset Password</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">
              Enter the OTP sent to {email} and your new password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">OTP Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  {...register("otp")}
                  className="bg-secondary/30 border-border h-12 text-center text-xl font-bold tracking-widest focus:ring-primary/20"
                />
                {errors.otp && (
                  <p className="text-xs text-red-500 font-bold uppercase">{errors.otp.message}</p>
                )}
                <p className="text-[10px] text-muted-foreground font-medium">Check your email for the 6-digit code</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">New Password</Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className="bg-secondary/30 border-border h-12 pr-12 rounded-xl focus:ring-primary/20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:bg-transparent hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 font-bold uppercase">{errors.password.message}</p>
                )}
                <p className="text-[10px] text-muted-foreground font-medium">At least 8 chars, uppercase, lowercase, number & special</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className="bg-secondary/30 border-border h-12 rounded-xl focus:ring-primary/20"
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 font-bold uppercase">{errors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-sm" disabled={isLoading}>
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isLoading ? "Synchronizing..." : "Update Security Credentials"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/forgot-password" className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors font-bold">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Authentication
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;