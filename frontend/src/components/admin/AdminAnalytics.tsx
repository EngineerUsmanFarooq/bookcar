import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Calendar, DollarSign, Car, Users, RefreshCw, Activity, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { carsAPI, bookingsAPI, usersAPI, Car as CarInterface, Booking } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    monthlyRevenue: [] as any[],
    carUtilization: [] as any[],
    topCars: [] as any[],
    categoryDistribution: [] as any[],
    bookingTrends: [] as any[],
    userGrowth: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dataStatus, setDataStatus] = useState({ bookings: 0, cars: 0, users: 0 });
  const { toast } = useToast();

  useEffect(() => {
    generateAnalytics();
  }, []);

  const generateAnalytics = async () => {
    try {
      setIsLoading(true);
      const [bookings, cars, users] = await Promise.all([
        bookingsAPI.getAll(),
        carsAPI.getAll(),
        usersAPI.getAll()
      ]);

      setDataStatus({ bookings: bookings.length, cars: cars.length, users: users.length });

      // Process Monthly Revenue
      const monthlyRevenue = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleString('default', { month: 'short' });
        const monthBookings = bookings.filter(booking => {
          if (!booking.createdAt) return false;
          const bookingDate = new Date(booking.createdAt);
          return bookingDate.getMonth() === date.getMonth() && bookingDate.getFullYear() === date.getFullYear();
        });
        const revenue = monthBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
        monthlyRevenue.push({ month, revenue });
      }

      // Process Car Utilization
      const carUtilization = cars.map(car => {
        const carBookings = bookings.filter(b => {
          const bCarId = typeof b.carId === 'string' ? b.carId : b.carId?._id;
          return bCarId === car._id;
        });
        const q = car.quantity || 1;
        const utilization = ((q - (car.available as number || 0)) / q) * 100;
        return {
          name: car.name,
          utilization: Math.round(utilization),
          bookings: carBookings.length,
          revenue: carBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
        };
      }).sort((a, b) => b.revenue - a.revenue);

      // Category Distribution
      const categoryDistribution = cars.reduce((acc, car) => {
        const cat = car.category || 'Standard';
        const existing = acc.find((item: any) => item.name === cat);
        if (existing) existing.value++;
        else acc.push({ name: cat, value: 1 });
        return acc;
      }, [] as any[]);

      setAnalytics({
        monthlyRevenue,
        carUtilization: carUtilization.slice(0, 8),
        topCars: carUtilization.slice(0, 5),
        categoryDistribution,
        bookingTrends: [],
        userGrowth: []
      });
    } catch (error: any) {
      toast({ title: "Intelligence sync failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#2563EB', '#10B981', '#6366F1', '#F59E0B', '#EF4444'];

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <RefreshCw className="h-10 w-10 text-primary animate-spin mx-auto mb-4 opacity-20" />
        <p className="text-muted-foreground font-medium tracking-widest text-xs uppercase">Analyzing Platform Data...</p>
      </div>
    );
  }

  const totalRevenue = analytics.monthlyRevenue.reduce((s, r) => s + r.revenue, 0);
  const avgUtilization = Math.round(analytics.carUtilization.reduce((s, c) => s + c.utilization, 0) / (analytics.carUtilization.length || 1));

  return (
    <div className="space-y-10">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all duration-300 group shadow-sm hover:shadow-md">
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4">Total Revenue Generated</p>
          <h3 className="text-5xl font-bold tracking-tighter mb-2 text-foreground">
            ${totalRevenue.toLocaleString()}
          </h3>
          <div className="flex items-center text-xs text-primary font-bold uppercase tracking-widest">
            <TrendingUp className="h-3 w-3 mr-2" /> Annualized Projections
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-success/5 border border-success/10 hover:bg-success/10 transition-all duration-300 shadow-sm hover:shadow-md">
          <p className="text-[10px] font-bold text-success uppercase tracking-[0.2em] mb-4">Average Fleet Utilization</p>
          <h3 className="text-5xl font-bold tracking-tighter mb-2 text-foreground">
            {avgUtilization}%
          </h3>
          <div className="flex items-center text-xs text-success font-bold uppercase tracking-widest">
            <Activity className="h-3 w-3 mr-2" /> Optimal Performance
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-secondary/30 border border-border hover:bg-secondary/50 transition-all duration-300 flex flex-col justify-center shadow-sm hover:shadow-md">
          <Button onClick={generateAnalytics} variant="ghost" className="w-full py-8 border border-border rounded-2xl flex flex-col items-center gap-2 hover:bg-primary hover:text-white group transition-all duration-300">
            <RefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-700" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Force Intelligence Sync</span>
          </Button>
        </div>
      </div>

      {/* Primary Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card className="bg-card border-border rounded-[2rem] overflow-hidden p-8 shadow-sm">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-lg font-bold">Revenue Dynamics</CardTitle>
            <CardDescription className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Monthly gross performance</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid hsl(var(--border))', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  itemStyle={{ color: 'hsl(var(--primary))', fontSize: '12px', fontWeight: 'bold' }}
                  cursor={{ fill: 'hsl(var(--primary) / 0.05)' }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border rounded-[2rem] overflow-hidden p-8 shadow-sm">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-lg font-bold">Fleet Allocation</CardTitle>
            <CardDescription className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Resource distribution</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="w-full md:w-2/3">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics.categoryDistribution}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {analytics.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/3 grid grid-cols-2 md:grid-cols-1 gap-3">
              {analytics.categoryDistribution.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Assets */}
      <Card className="bg-card border-border rounded-[2rem] overflow-hidden p-8 shadow-sm">
        <CardHeader className="p-0 mb-10">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
            <Star className="h-5 w-5 text-primary" /> High-Performance Assets
          </CardTitle>
          <CardDescription className="text-sm font-medium text-muted-foreground">Top vehicles contributing to platform revenue</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.topCars.map((car, idx) => (
              <div key={idx} className="flex items-center justify-between p-6 rounded-2xl bg-secondary/20 border border-transparent hover:border-primary/20 hover:bg-secondary/40 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-black text-muted-foreground/20 group-hover:text-primary transition-colors">0{idx + 1}</div>
                  <div>
                    <h4 className="font-bold text-base text-foreground mb-1">{car.name}</h4>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{car.bookings} Journeys</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-foreground mb-1">${car.revenue.toLocaleString()}</div>
                  <div className="flex items-center justify-end text-[10px] text-success font-bold uppercase tracking-widest gap-1">
                    <Zap className="h-3 w-3" /> {car.utilization}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
