import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/services/api";
import { ArrowLeft } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string()
    .email("Please enter a valid email address")
    .refine((email) => email.toLowerCase().endsWith('@gmail.com'), "Only Gmail addresses are allowed"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);

    try {
      await authAPI.forgotPassword(data.email);

      toast({
        title: "OTP Sent!",
        description: "Please check your email for the password reset code.",
      });

      setEmailSent(true);
    } catch (error) {
      toast({
        title: "Failed to send OTP",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="dark min-h-screen bg-[#0F0F0F] text-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/5 rounded-full blur-[140px]"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/5 rounded-full blur-[140px]"></div>
        </div>
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2">
              <img src="/Logo.jpg" alt="RentCar Logo" className="h-10 w-10 rounded-xl" />
              <span className="text-2xl font-bold text-white">Rent<span className="text-blue-500">Car</span></span>
            </Link>
          </div>

          <Card className="bg-[#161616] border-white/5 shadow-2xl">
            <CardHeader>
              <CardTitle>Check Your Email</CardTitle>
              <CardDescription className="text-gray-400">
                We've sent a password reset OTP to {getValues("email")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-400">
                Click the link below to enter your OTP and reset your password.
              </p>
              <Button asChild className="w-full">
                <Link to={`/reset-password?email=${encodeURIComponent(getValues("email"))}`}>
                  Enter OTP
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full border-white/10 hover:bg-white/5"
                onClick={() => setEmailSent(false)}
              >
                Try Different Email
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-[#0F0F0F] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/5 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/5 rounded-full blur-[140px]"></div>
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <img src="/Logo.jpg" alt="RentCar Logo" className="h-10 w-10 rounded-xl" />
            <span className="text-2xl font-bold text-white">Rent<span className="text-blue-500">Car</span></span>
          </Link>
        </div>

        <Card className="bg-[#161616] border-white/5 shadow-2xl">
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your email address and we'll send you a code to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
                <p className="text-xs text-gray-500">Enter your registered Gmail address</p>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Code"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="inline-flex items-center text-sm text-blue-500 hover:text-blue-400 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;