import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/services/api";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get email from location state (passed from register page)
  const email = location.state?.email;

  if (!email) {
    // Redirect to register if no email
    navigate("/register");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.verifyOTP(email, otp);

      localStorage.setItem("user", JSON.stringify(response.user));

      toast({
        title: "Account created successfully!",
        description: "Welcome to RentCar. You can now browse and book cars.",
      });

      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      // For resend, we need to call register again with the same data
      // This would require storing the registration data temporarily
      // For now, show a message to register again
      toast({
        title: "Please register again",
        description: "For security reasons, please go back to registration and try again.",
        variant: "destructive"
      });
    } catch (error) {
      toast({
        title: "Failed to resend OTP",
        description: "Please try registering again.",
        variant: "destructive"
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <img src="/Logo.jpg" alt="RentCar Logo" className="h-8 w-8 rounded" />
            <span className="text-2xl font-bold text-gray-900">RentCar</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Verify Your Email</CardTitle>
            <CardDescription>
              We've sent a 6-digit OTP to {email}. Please enter it below to complete your registration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Didn't receive the OTP?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-blue-600 hover:underline"
                  onClick={handleResendOTP}
                  disabled={resendLoading}
                >
                  {resendLoading ? "Sending..." : "Resend OTP"}
                </Button>
              </p>
              <p className="text-sm text-gray-600">
                <Button
                  variant="link"
                  className="p-0 h-auto text-gray-600 hover:underline"
                  onClick={() => navigate("/register")}
                >
                  Back to Registration
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyOTP;