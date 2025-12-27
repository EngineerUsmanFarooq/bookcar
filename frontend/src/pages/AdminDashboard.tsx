import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Plus, Users, Calendar, TrendingUp, AlertTriangle, LogOut, Car as CarIcon, DollarSign, BarChart3, Shield, Zap, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CarManagement from "@/components/admin/CarManagement";
import BookingManagement from "@/components/admin/BookingManagement";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import UserManagement from "@/components/admin/UserManagement";
import { carsAPI, bookingsAPI, usersAPI } from "@/services/api";
import CarLoader from "@/components/ui/CarLoader";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalCars: 0,
    activeBookings: 0,
    totalUsers: 0,
    lowStockCars: 0,
    revenue: 0
  });
  const [animatedStats, setAnimatedStats] = useState({
    totalCars: 0,
    activeBookings: 0,
    totalUsers: 0,
    lowStockCars: 0,
    revenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "admin") {
        navigate("/dashboard");
        return;
      }

      setUser(parsedUser);
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.removeItem("user");
      navigate("/login");
      return;
    }
    loadStats();
  }, [navigate]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const [cars, bookings, users] = await Promise.all([
        carsAPI.getAll(),
        bookingsAPI.getAll(),
        usersAPI.getAll()
      ]);

      const activeBookings = bookings.filter(b => b.status === "confirmed").length;
      const lowStockCars = cars.filter(c => c.quantity <= 2).length;
      const revenue = bookings
        .filter(b => b.status === "confirmed")
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      const newStats = {
        totalCars: cars.length,
        activeBookings,
        totalUsers: users.length,
        lowStockCars,
        revenue
      };

      setStats(newStats);
      animateStats(newStats);
    } catch (error) {
      toast({
        title: "Error loading statistics",
        description: error.message || "Failed to load dashboard statistics",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const animateStats = (targetStats) => {
    const duration = 1200; // 1.2 seconds
    const steps = 60;
    const increment = {
      totalCars: targetStats.totalCars / steps,
      activeBookings: targetStats.activeBookings / steps,
      totalUsers: targetStats.totalUsers / steps,
      lowStockCars: targetStats.lowStockCars / steps,
      revenue: targetStats.revenue / steps
    };

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setAnimatedStats({
        totalCars: Math.min(Math.round(increment.totalCars * currentStep), targetStats.totalCars),
        activeBookings: Math.min(Math.round(increment.activeBookings * currentStep), targetStats.activeBookings),
        totalUsers: Math.min(Math.round(increment.totalUsers * currentStep), targetStats.totalUsers),
        lowStockCars: Math.min(Math.round(increment.lowStockCars * currentStep), targetStats.lowStockCars),
        revenue: Math.min(Math.round(increment.revenue * currentStep), targetStats.revenue)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of the admin panel.",
    });
    navigate("/");
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <CarLoader className="mb-6" />
          <p className="text-gray-600 text-lg animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-[#0F0F0F] text-white selection:bg-blue-500/30">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/5 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/5 rounded-full blur-[140px]"></div>
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F0F0F]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img src="/Logo.jpg" alt="Logo" className="h-10 w-10 rounded-xl shadow-2xl transition-all group-hover:scale-105" />
                <div className="absolute inset-0 bg-blue-500/20 rounded-xl filter blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Rent<span className="text-blue-500">Car</span><span className="ml-2 text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Admin</span>
              </span>
            </Link>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-white">{user?.name}</p>
                  <p className="text-[10px] text-blue-500 uppercase tracking-widest font-bold">Platform Director</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border border-white/10 shadow-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative pt-32 pb-20 px-4 z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className={`mb-12 transition-all duration-1000 transform ${showWelcome ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 rounded-full px-4 py-1.5 border border-blue-500/20 mb-6">
            <Activity className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Platform Insights</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Overview</span>
          </h1>
          <p className="text-gray-400 font-light text-lg">Real-time performance metrics and fleet management console.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <Card className="bg-[#161616] border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <CarIcon className="h-12 w-12 text-blue-500" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-500 uppercase tracking-widest text-[9px] font-bold">Total Fleet</CardDescription>
              <CardTitle className="text-3xl font-bold text-white mt-1">{animatedStats.totalCars}</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={(animatedStats.totalCars / Math.max(stats.totalCars, 1)) * 100} className="h-1 bg-white/5" indicatorClassName="bg-blue-500" />
            </CardContent>
          </Card>

          <Card className="bg-[#161616] border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <Calendar className="h-12 w-12 text-green-500" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-500 uppercase tracking-widest text-[9px] font-bold">Active Bookings</CardDescription>
              <CardTitle className="text-3xl font-bold text-white mt-1">{animatedStats.activeBookings}</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={(animatedStats.activeBookings / Math.max(stats.activeBookings, 1)) * 100} className="h-1 bg-white/5" indicatorClassName="bg-green-500" />
            </CardContent>
          </Card>

          <Card className="bg-[#161616] border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <Users className="h-12 w-12 text-purple-500" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-500 uppercase tracking-widest text-[9px] font-bold">Total Clients</CardDescription>
              <CardTitle className="text-3xl font-bold text-white mt-1">{animatedStats.totalUsers}</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={(animatedStats.totalUsers / Math.max(stats.totalUsers, 1)) * 100} className="h-1 bg-white/5" indicatorClassName="bg-purple-500" />
            </CardContent>
          </Card>

          <Card className="bg-[#161616] border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <AlertTriangle className="h-12 w-12 text-orange-500" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-500 uppercase tracking-widest text-[9px] font-bold">Low Availability</CardDescription>
              <CardTitle className="text-3xl font-bold text-orange-500 mt-1">{animatedStats.lowStockCars}</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={(animatedStats.lowStockCars / Math.max(stats.lowStockCars, 1)) * 100} className="h-1 bg-white/5" indicatorClassName="bg-orange-500" />
            </CardContent>
          </Card>

          <Card className="bg-[#161616] border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <DollarSign className="h-12 w-12 text-emerald-500" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-500 uppercase tracking-widest text-[9px] font-bold">Total Revenue</CardDescription>
              <CardTitle className="text-3xl font-bold text-emerald-500 mt-1">${animatedStats.revenue}</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={(animatedStats.revenue / Math.max(stats.revenue, 1)) * 100} className="h-1 bg-white/5" indicatorClassName="bg-emerald-500" />
            </CardContent>
          </Card>
        </div>

        {/* Console Tabs */}
        <div className="bg-[#161616] border border-white/5 rounded-[2rem] p-8 shadow-2xl">
          <Tabs defaultValue="cars" className="w-full">
            <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-2xl mb-10 inline-flex">
              <TabsTrigger value="cars" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all px-8 py-2.5 font-bold text-xs uppercase tracking-widest">
                <CarIcon className="h-4 w-4 mr-2" /> Fleet Management
              </TabsTrigger>
              <TabsTrigger value="bookings" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all px-8 py-2.5 font-bold text-xs uppercase tracking-widest">
                <Calendar className="h-4 w-4 mr-2" /> Operations
              </TabsTrigger>
              <TabsTrigger value="users" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all px-8 py-2.5 font-bold text-xs uppercase tracking-widest">
                <Users className="h-4 w-4 mr-2" /> User Control
              </TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all px-8 py-2.5 font-bold text-xs uppercase tracking-widest">
                <BarChart3 className="h-4 w-4 mr-2" /> Intelligence
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cars" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <CarManagement onStatsUpdate={loadStats} />
            </TabsContent>

            <TabsContent value="bookings" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <BookingManagement onStatsUpdate={loadStats} />
            </TabsContent>

            <TabsContent value="users" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <UserManagement onStatsUpdate={loadStats} />
            </TabsContent>

            <TabsContent value="analytics" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <AdminAnalytics />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="py-12 border-t border-white/5 text-center mt-20 relative z-10">
        <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] font-bold">&copy; 2025 RentCar Enterprise Console. Powered by Advanced Mobility Intelligence.</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;



