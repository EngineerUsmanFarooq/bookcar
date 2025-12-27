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

  const COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <RefreshCw className="h-10 w-10 text-blue-500 animate-spin mx-auto mb-4 opacity-20" />
        <p className="text-gray-500 font-light tracking-widest text-xs uppercase">Analyzing Platform Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-blue-600/5 border border-blue-500/10 hover:bg-blue-600/10 transition-colors group">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-4">Total Revenue Generated</p>
          <h3 className="text-5xl font-bold tracking-tighter mb-2">
            ${analytics.monthlyRevenue.reduce((s, r) => s + r.revenue, 0).toLocaleString()}
          </h3>
          <div className="flex items-center text-xs text-blue-400 font-bold uppercase tracking-widest">
            <TrendingUp className="h-3 w-3 mr-2" /> Annualized Projections
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Average Fleet Utilization</p>
          <h3 className="text-5xl font-bold tracking-tighter mb-2">
            {Math.round(analytics.carUtilization.reduce((s, c) => s + c.utilization, 0) / (analytics.carUtilization.length || 1))}%
          </h3>
          <div className="flex items-center text-xs text-green-500 font-bold uppercase tracking-widest">
            <Activity className="h-3 w-3 mr-2" /> Optimal Performance
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex flex-col justify-center">
          <Button onClick={generateAnalytics} variant="ghost" className="w-full py-8 border border-white/10 rounded-2xl flex flex-col items-center gap-2 hover:bg-blue-600 hover:text-white group">
            <RefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-700" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Force Intelligence Sync</span>
          </Button>
        </div>
      </div>

      {/* Primary Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card className="bg-[#1C1C1C] border-white/5 rounded-[2rem] overflow-hidden p-8">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-lg font-bold">Revenue Dynamics</CardTitle>
            <CardDescription className="text-xs font-light text-gray-500">Monthly gross performance across last 12 cycles</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.monthlyRevenue}>
                <XAxis dataKey="month" stroke="#444" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#444" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#60A5FA', fontSize: '10px', fontWeight: 'bold' }}
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                />
                <Bar dataKey="revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1C1C1C] border-white/5 rounded-[2rem] overflow-hidden p-8">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-lg font-bold">Fleet Allocation</CardTitle>
            <CardDescription className="text-xs font-light text-gray-500">Resource distribution by vehicle segment</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categoryDistribution}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analytics.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-1/3 space-y-3">
              {analytics.categoryDistribution.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Assets */}
      <Card className="bg-[#1C1C1C] border-white/5 rounded-[2rem] overflow-hidden p-8">
        <CardHeader className="p-0 mb-10">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Star className="h-5 w-5 text-blue-500" /> High-Performance Assets
          </CardTitle>
          <CardDescription className="text-sm font-light text-gray-400">Top 5 vehicles contributing to ecosystem revenue</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-6">
            {analytics.topCars.map((car, idx) => (
              <div key={idx} className="flex items-center justify-between p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors group">
                <div className="flex items-center gap-6">
                  <div className="text-2xl font-black text-white/10 group-hover:text-blue-500/20 transition-colors">0{idx + 1}</div>
                  <div>
                    <h4 className="font-bold text-lg">{car.name}</h4>
                    <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">{car.bookings} Managed Journeys</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">${car.revenue.toLocaleString()}</div>
                  <div className="flex items-center justify-end text-[10px] text-gray-500 font-bold uppercase tracking-widest gap-2">
                    <Zap className="h-3 w-3 text-green-500" /> {car.utilization}% Operation Rate
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
