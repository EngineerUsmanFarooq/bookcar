import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, UserPlus, Shield, ArrowRight, Mail, Lock, User, CheckCircle } from "lucide-react";
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
      navigate("/verify-otp", { state: { email: response.email } });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <img src="/Logo.jpg" alt="Logo" className="h-10 w-10 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">RentCar</span>
          </Link>
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Welcome Badge */}
        <div className={`text-center mb-8 transition-all duration-1000 ${showForm ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/20">
            <UserPlus className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Join RentCar Today</span>
          </div>
        </div>

        {/* Register Card */}
        <Card className={`bg-white/80 backdrop-blur-sm border-white/20 shadow-2xl transition-all duration-1000 ${showForm ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto bg-gradient-to-br from-purple-500 to-pink-600 rounded-full p-3 w-16 h-16 flex items-center justify-center shadow-lg">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Create Your Account
            </CardTitle>
            <CardDescription className="text-gray-600">
              Join thousands of satisfied customers and start your journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 font-medium flex items-center">
                  <User className="h-4 w-4 mr-2 text-purple-500" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  {...register("name")}
                  className="bg-white/50 backdrop-blur-sm border-white/20 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {errors.name.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">Full name must be 2-50 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-purple-500" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                  className="bg-white/50 backdrop-blur-sm border-white/20 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {errors.email.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">Enter a valid Gmail address</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-purple-500" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    {...register("password")}
                    className="bg-white/50 backdrop-blur-sm border-white/20 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500 hover:text-gray-700 transition-colors duration-200" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500 hover:text-gray-700 transition-colors duration-200" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {errors.password.message}
                  </p>
                )}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Password requirements:</p>
                  <div className="grid grid-cols-2 gap-1">
                    <span className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                      8+ characters
                    </span>
                    <span className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                      Upper & lowercase
                    </span>
                    <span className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                      Number
                    </span>
                    <span className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                      Special character
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-purple-500" />
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  {...register("confirmPassword")}
                  className="bg-white/50 backdrop-blur-sm border-white/20 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {errors.confirmPassword.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">Must match the password above</p>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Create Account
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-gray-200/50">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-300 hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Benefits */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200/50">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Shield className="h-4 w-4 mr-2 text-purple-500" />
                Why Join RentCar?
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                  Premium fleet
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                  24/7 support
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                  Best rates
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                  Easy booking
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
