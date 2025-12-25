import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Plus, Users, Calendar, TrendingUp, AlertTriangle, LogOut, Car, DollarSign, BarChart3, Shield, Zap, Activity } from "lucide-react";
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
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    
    setUser(parsedUser);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Welcome Section */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className={`transition-all duration-1000 ${showWelcome ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/20 mb-6">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Admin Dashboard</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                Welcome back, {user.name}
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Manage your car rental platform with powerful analytics and real-time insights
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">Total Cars</CardTitle>
                <Car className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-blue-600 mb-1 transition-all duration-300 group-hover:scale-110">
                  {animatedStats.totalCars}
                </div>
                <Progress value={(animatedStats.totalCars / Math.max(stats.totalCars, 1)) * 100} className="h-2" />
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">Active Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-green-600 mb-1 transition-all duration-300 group-hover:scale-110">
                  {animatedStats.activeBookings}
                </div>
                <Progress value={(animatedStats.activeBookings / Math.max(stats.activeBookings, 1)) * 100} className="h-2" />
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                <Users className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-purple-600 mb-1 transition-all duration-300 group-hover:scale-110">
                  {animatedStats.totalUsers}
                </div>
                <Progress value={(animatedStats.totalUsers / Math.max(stats.totalUsers, 1)) * 100} className="h-2" />
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">Low Stock</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-orange-600 mb-1 transition-all duration-300 group-hover:scale-110">
                  {animatedStats.lowStockCars}
                </div>
                <Progress value={(animatedStats.lowStockCars / Math.max(stats.lowStockCars, 1)) * 100} className="h-2" />
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-emerald-600 mb-1 transition-all duration-300 group-hover:scale-110">
                  ${animatedStats.revenue}
                </div>
                <Progress value={(animatedStats.revenue / Math.max(stats.revenue, 1)) * 100} className="h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <Tabs defaultValue="cars" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border border-white/20 mb-6">
                <TabsTrigger value="cars" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-300">
                  <Car className="h-4 w-4" />
                  <span>Cars</span>
                </TabsTrigger>
                <TabsTrigger value="bookings" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white transition-all duration-300">
                  <Calendar className="h-4 w-4" />
                  <span>Bookings</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300">
                  <Users className="h-4 w-4" />
                  <span>Users</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white transition-all duration-300">
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cars" className="mt-6 animate-in slide-in-from-left-5 duration-500">
                <CarManagement onStatsUpdate={loadStats} />
              </TabsContent>

              <TabsContent value="bookings" className="mt-6 animate-in slide-in-from-left-5 duration-500">
                <BookingManagement onStatsUpdate={loadStats} />
              </TabsContent>

              <TabsContent value="users" className="mt-6 animate-in slide-in-from-left-5 duration-500">
                <UserManagement onStatsUpdate={loadStats} />
              </TabsContent>

              <TabsContent value="analytics" className="mt-6 animate-in slide-in-from-left-5 duration-500">
                <AdminAnalytics />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
