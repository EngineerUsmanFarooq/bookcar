import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, User as UserIcon, LogOut, Eye, Bell, Check, RefreshCw, TrendingUp, Car as CarIcon, MapPin, Star, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { bookingsAPI, notificationsAPI, User, Booking, Notification } from "@/services/api";
import CarLoader from "@/components/ui/CarLoader";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingNotifications, setIsRefreshingNotifications] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0
  });
  const [showWelcome, setShowWelcome] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let notificationInterval: any;
    let welcomeTimer: any;

    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role === "admin") {
        navigate("/admin");
        return;
      }

      // Determine user ID, supporting both `id` and `_id`
      const userId = parsedUser.id ?? parsedUser._id;
      if (!userId) {
        console.warn('User ID missing, redirecting to login');
        navigate('/login');
        return;
      }

      setUser(parsedUser);
      loadBookings(userId);
      loadNotifications(userId);

      // Set up polling for notifications every 30 seconds
      notificationInterval = setInterval(() => {
        loadNotifications(parsedUser.id);
      }, 30000); // 30 seconds

    } catch (error) {
      console.error("Error parsing user data:", error);
      // Optionally redirect to login on parse error
      navigate('/login');
      return;
    }

    // Hide welcome message after 3 seconds
    welcomeTimer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);

    // Cleanup intervals on unmount
    return () => {
      if (notificationInterval) clearInterval(notificationInterval);
      if (welcomeTimer) clearTimeout(welcomeTimer);
    };
  }, [navigate]);

  const loadBookings = async (userId) => {
    try {
      setIsLoading(true);
      const userBookings = await bookingsAPI.getByUserId(userId);
      setBookings(userBookings);

      // Animate stats
      const total = userBookings.length;
      const active = userBookings.filter(b => b.status === "active" || b.status === "confirmed").length;
      const completed = userBookings.filter(b => b.status === "completed").length;

      animateStats(total, active, completed);
    } catch (error) {
      toast({
        title: "Error loading bookings",
        description: error.message || "Failed to load your bookings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const animateStats = (total, active, completed) => {
    const duration = 1000; // 1 second
    const steps = 60;
    const increment = {
      total: total / steps,
      active: active / steps,
      completed: completed / steps
    };

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setAnimatedStats({
        totalBookings: Math.min(Math.round(increment.total * currentStep), total),
        activeBookings: Math.min(Math.round(increment.active * currentStep), active),
        completedBookings: Math.min(Math.round(increment.completed * currentStep), completed)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);
  };

  const loadNotifications = async (userId) => {
    try {
      const userNotifications = await notificationsAPI.getByUserId(userId);
      setNotifications(userNotifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const refreshNotifications = async () => {
    if (user) {
      setIsRefreshingNotifications(true);
      try {
        await loadNotifications(user.id);
        toast({
          title: "Notifications refreshed",
          description: "Your notifications have been updated.",
        });
      } finally {
        setIsRefreshingNotifications(false);
      }
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(notifications.map(notif =>
        notif._id === notificationId ? { ...notif, isRead: true } : notif
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    navigate("/");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed": return "default";
      case "active": return "secondary";
      case "completed": return "outline";
      case "cancelled": return "destructive";
      default: return "outline";
    }
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <CarLoader className="mb-6" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          </div>
          <p className="text-muted-foreground text-lg font-medium animate-pulse">Loading your dashboard...</p>
          <div className="mt-4 w-64 mx-auto">
            <Progress value={75} className="h-2 bg-secondary" indicatorClassName="bg-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/1 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-success/1 rounded-full blur-[140px]"></div>
      </div>
      {/* Welcome Animation Overlay */}
      {showWelcome && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl text-center animate-bounce-in">
            <div className="w-16 h-16 bg-gradient-to-r rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-white animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome back, {user.name}!</h2>
            <p className="text-muted-foreground">Your dashboard is ready</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <img src="/Logo.jpg" alt="Logo" className="h-12 w-12 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                RentCar
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/cars">
                <Button variant="outline" className="hover:scale-105 transition-transform duration-200 shadow-md hover:shadow-lg">
                  <CarIcon className="h-4 w-4 mr-2" />
                  Browse Cars
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in-up">
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-black mb-2 animate-slide-in-left text-white drop-shadow-md">
                  Welcome back, {user.name}! 👋
                </h1>
                <p className="text-white text-lg font-medium animate-slide-in-left animation-delay-200 drop-shadow-sm">
                  Ready to explore amazing cars and manage your bookings
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
                  <Zap className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="group hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl bg-gradient-to-br from-primary to-primary/80 text-white border-0 animate-fade-in-up animation-delay-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-white">
                <CarIcon className="h-5 w-5 mr-2" />
                Book a Car
              </CardTitle>
              <CardDescription className="text-white/80">Find and book your next ride</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/cars">
                <Button className="w-full bg-white text-primary hover:bg-white/90 group-hover:scale-105 transition-transform duration-200">
                  Browse Cars
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:scale-105 transition-all duration-300 shadow-sm bg-card border-border animate-fade-in-up animation-delay-400">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                Total Bookings
              </CardTitle>
              <CardDescription className="text-muted-foreground">Your booking history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-2 animate-count-up">
                {animatedStats.totalBookings}
              </div>
              <Progress value={(animatedStats.totalBookings / Math.max(bookings.length, 1)) * 100} className="h-2 bg-secondary" indicatorClassName="bg-primary" />
            </CardContent>
          </Card>

          <Card className="group hover:scale-105 transition-all duration-300 shadow-sm bg-card border-border animate-fade-in-up animation-delay-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-success" />
                Active Bookings
              </CardTitle>
              <CardDescription className="text-muted-foreground">Currently active rentals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-success mb-2 animate-count-up">
                {animatedStats.activeBookings}
              </div>
              <Progress
                value={(animatedStats.activeBookings / Math.max(bookings.filter(b => b.status === "active" || b.status === "confirmed").length, 1)) * 100}
                className="h-2 bg-secondary"
                indicatorClassName="bg-success"
              />
            </CardContent>
          </Card>

          <Card className="group hover:scale-105 transition-all duration-300 shadow-sm bg-card border-border animate-fade-in-up animation-delay-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Check className="h-5 w-5 mr-2 text-indigo-500" />
                Completed
              </CardTitle>
              <CardDescription className="text-muted-foreground">Successfully completed trips</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-indigo-500 mb-2 animate-count-up">
                {animatedStats.completedBookings}
              </div>
              <Progress
                value={(animatedStats.completedBookings / Math.max(bookings.filter(b => b.status === "completed").length, 1)) * 100}
                className="h-2 bg-secondary"
                indicatorClassName="bg-indigo-500"
              />
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <Card className="mb-8 shadow-sm border-border bg-card animate-fade-in-up animation-delay-700">
            <CardHeader className="bg-white rounded-t-lg border-b border-border">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative">
                    <Bell className="h-6 w-6 mr-3 text-primary" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    Notifications
                  </span>
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <Badge variant="destructive" className="ml-3 animate-bounce">
                      {notifications.filter(n => !n.isRead).length} new
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={refreshNotifications}
                  disabled={isRefreshingNotifications}
                  className="h-8 w-8 p-0 hover:bg-primary/10 transition-colors duration-200"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshingNotifications ? 'animate-spin text-primary' : 'text-muted-foreground'}`} />
                </Button>
              </CardTitle>
              <CardDescription className="text-muted-foreground">Your latest messages and updates</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {notifications.slice(0, 5).map((notification, index) => (
                  <div
                    key={notification._id}
                    className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-lg animate-slide-in-right ${notification.isRead
                      ? 'bg-card border-gray-200 hover:bg-gray-50'
                      : 'bg-white border-blue-200 hover:border-blue-300 shadow-sm'
                      }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`w-2 h-2 rounded-full ${notification.isRead ? 'bg-gray-400' : 'bg-blue-500 animate-pulse'}`}></div>
                          <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                        </div>
                        <p className="text-gray-700 mb-3 leading-relaxed">{notification.message}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                      {!notification.isRead && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markNotificationAsRead(notification._id)}
                          className="ml-3 hover:bg-green-100 hover:text-green-600 transition-colors duration-200 group"
                        >
                          <Check className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Bookings */}
        <Card className="shadow-sm border-border bg-card animate-fade-in-up animation-delay-800">
          <CardHeader className="bg-white rounded-t-lg border-b border-border">
            <CardTitle className="flex items-center text-2xl">
              <div className="relative mr-3">
                <Calendar className="h-7 w-7 text-primary" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse shadow-sm"></div>
              </div>
              <span className="text-blue-600 font-bold tracking-tight">
                Your Bookings
              </span>
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm font-medium">
              {bookings.length === 0
                ? "You haven't made any bookings yet."
                : `Active Overview (${bookings.length} Total)`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {bookings.length === 0 ? (
              <div className="text-center py-12 animate-fade-in-up">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-400/2 to-blue-600/2 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <CarIcon className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">No bookings yet</h3>
                <p className="text-muted-foreground mb-6 text-lg">Ready to hit the road? Book your first car!</p>
                <Link to="/cars">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-600/90 hover:to-blue-400/90 text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                    <CarIcon className="h-5 w-5 mr-2" />
                    Browse Cars
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map((booking, index) => (
                  <div
                    key={booking._id}
                    className="group border border-border rounded-2xl p-6 shadow-sm bg-white hover:bg-white transition-all duration-500 transform hover:scale-[1.01] animate-slide-in-up"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                          <CarIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xl text-foreground group-hover:text-blue-600 transition-colors duration-300">
                            {(typeof booking.carId === 'object' && booking.carId?.name) || 'Unknown Car'}
                          </h4>
                          <p className="text-muted-foreground text-sm font-medium">
                            Booking #{booking._id.slice(-8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={getStatusColor(booking.status)}
                        className="px-4 py-2 text-sm font-semibold shadow-md animate-pulse"
                      >
                        {booking.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="flex items-center space-x-3 p-3 bg-muted/40 rounded-lg group-hover:bg-muted/60 transition-colors duration-300">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">DATES</p>
                          <span className="text-sm font-semibold text-foreground">
                            {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-muted/40 rounded-lg group-hover:bg-muted/60 transition-colors duration-300">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">TIME</p>
                          <span className="text-sm font-semibold text-foreground">
                            {booking.startTime} - {booking.endTime}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-muted/40 rounded-lg group-hover:bg-muted/60 transition-colors duration-300">
                        <UserIcon className="h-5 w-5 text-indigo-500" />
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">SERVICE</p>
                          <span className="text-sm font-semibold text-foreground">
                            {booking.needDriver ? "With Driver" : "Self-Drive"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-border">
                      <div className="flex items-center space-x-2">
                        <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                          ${booking.totalAmount}
                        </span>
                        <span className="text-sm text-muted-foreground">total</span>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all duration-300 group-hover:scale-105"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center text-xl">
                              <CarIcon className="h-6 w-6 mr-2 text-blue-600" />
                              Booking Details
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                              Complete information for booking #{booking._id}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="bg-gradient-to-r from-blue-600/5 to-blue-400/5 p-4 rounded-lg border border-blue-600/10">
                              <h4 className="font-bold mb-3 text-lg text-foreground">🚗 Car Information</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="font-semibold text-muted-foreground">Car:</p>
                                  <p className="text-foreground">{(typeof booking.carId === 'object' ? booking.carId?.name : '') || 'Unknown Car'}</p>
                                </div>
                                <div>
                                  <p className="font-semibold text-muted-foreground">Model:</p>
                                  <p className="text-foreground">{(typeof booking.carId === 'object' ? booking.carId?.model : '') || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="font-semibold text-muted-foreground">Category:</p>
                                  <p className="text-foreground">{(typeof booking.carId === 'object' ? booking.carId?.category : '') || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="font-semibold text-muted-foreground">Transmission:</p>
                                  <p className="text-foreground">{(typeof booking.carId === 'object' ? booking.carId?.transmission : '') || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="font-semibold text-muted-foreground">Seats:</p>
                                  <p className="text-foreground">{(typeof booking.carId === 'object' ? booking.carId?.seats : '') || 'N/A'}</p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-600/5 to-blue-400/5 p-4 rounded-lg border border-blue-600/10">
                              <h4 className="font-bold mb-3 text-lg text-foreground">📅 Booking Information</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="font-semibold text-muted-foreground">Booking ID:</p>
                                  <p className="text-foreground font-mono">#{booking._id}</p>
                                </div>
                                <div>
                                  <p className="font-semibold text-muted-foreground">Status:</p>
                                  <Badge variant={getStatusColor(booking.status)} className="mt-1 shadow-sm">
                                    {booking.status}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="font-semibold text-muted-foreground">Start Date:</p>
                                  <p className="text-foreground">{new Date(booking.startDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="font-semibold text-muted-foreground">End Date:</p>
                                  <p className="text-foreground">{new Date(booking.endDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="font-semibold text-muted-foreground">Start Time:</p>
                                  <p className="text-foreground">{booking.startTime}</p>
                                </div>
                                <div>
                                  <p className="font-semibold text-muted-foreground">End Time:</p>
                                  <p className="text-foreground">{booking.endTime}</p>
                                </div>
                                <div>
                                  <p className="font-semibold text-muted-foreground">Service:</p>
                                  <p className="text-foreground">{booking.needDriver ? "With Driver" : "Self-Drive"}</p>
                                </div>
                                <div>
                                  <p className="font-semibold text-muted-foreground">Total Amount:</p>
                                  <p className="text-2xl font-bold text-success">${booking.totalAmount}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
