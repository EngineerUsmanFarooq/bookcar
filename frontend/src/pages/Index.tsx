import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Star, Car, Shield, Zap, ArrowRight, CheckCircle } from "lucide-react";

const Index = () => {
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem("user");
    try {
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.removeItem("user");
      return null;
    }
  });
  const [showHero, setShowHero] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showCars, setShowCars] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setShowHero(true), 200);
    setTimeout(() => setShowFeatures(true), 600);
    setTimeout(() => setShowCars(true), 1000);
  }, []);

  const featuredCars = [
    {
      id: 1,
      name: "Toyota Camry",
      image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
      pricePerHour: 2500,
      seats: 5,
      transmission: "Automatic",
      rating: 4.8,
      features: ["GPS Navigation", "Bluetooth", "Air Conditioning"]
    },
    {
      id: 2,
      name: "BMW X5",
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
      pricePerHour: 4500,
      seats: 7,
      transmission: "Automatic",
      rating: 4.9,
      features: ["Premium Sound", "Leather Seats", "All-Wheel Drive"]
    },
    {
      id: 3,
      name: "Mercedes C-Class",
      image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800",
      pricePerHour: 3500,
      seats: 5,
      transmission: "Automatic",
      rating: 4.7,
      features: ["Luxury Interior", "Advanced Safety", "Heated Seats"]
    }
  ];

  const handleBrowseCars = () => {
    navigate("/cars");
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-success/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img src="/Logo.jpg" alt="Logo" className="h-10 w-10 rounded-xl shadow-2xl transition-all duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-blue-500/20 rounded-xl filter blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <span className="text-2xl font-bold tracking-tight text-foreground">
                Rent<span className="text-primary">Car</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-10">
              <Link to="/cars" className="text-sm font-medium text-gray-400 hover:text-blue-600 transition-colors">Browse Fleet</Link>
              <Link to="/about" className="text-sm font-medium text-gray-400 hover:text-blue-600 transition-colors">Experience</Link>
              <Link to="/contact" className="text-sm font-medium text-gray-400 hover:text-blue-600 transition-colors">Support</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-secondary font-medium">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-sm transition-all px-6">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-4 z-10">
        <div className="max-w-7xl mx-auto">
          <div className={`transition-all duration-1000 transform ${showHero ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>


            <h1 className="text-6xl md:text-8xl font-bold text-center tracking-tighter leading-none mb-10">
              Drive the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">Future</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 text-center max-w-3xl mx-auto leading-relaxed mb-16 font-light">
              Experience the pinnacle of automotive excellence. Our curated collection of high-performance and luxury vehicles awaits your next journey.
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <Button size="lg" className="bg-primary text-white hover:bg-primary/90 px-10 py-7 text-lg font-bold transition-all hover:scale-105 active:scale-95" onClick={handleBrowseCars}>
                Explore Fleet
              </Button>
              <Button size="lg" variant="outline" className="border-border bg-background hover:bg-secondary text-foreground px-10 py-7 text-lg font-medium transition-all shadow-sm">
                Learn More
              </Button>
            </div>

            {/* Featured Car Background Element */}
            <div className="mt-24 relative max-w-5xl mx-auto">
              <img
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200"
                alt="Featured Car"
                className="rounded-[2.5rem] shadow-2xl border border-border"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent rounded-[2.5rem]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-secondary/30 z-10 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-6 group">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold">Absolute Security</h3>
              <p className="text-muted-foreground leading-relaxed font-light">
                Comprehensive insurance coverage and 24/7 endpoint monitoring for every journey you undertake.
              </p>
            </div>

            <div className="space-y-6 group">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold">Instant Booking</h3>
              <p className="text-muted-foreground leading-relaxed font-light">
                Seamless digital experience. From selection to ignition in less than 60 seconds with our streamlined app.
              </p>
            </div>

            <div className="space-y-6 group">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                <Star className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold">Concierge Service</h3>
              <p className="text-muted-foreground leading-relaxed font-light">
                Dedicated support team available around the clock to ensure your driving experience is nothing short of perfect.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cars Grid */}
      <section className="py-32 z-10 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tight">The Collection</h2>
              <p className="text-muted-foreground text-lg font-light">Carefully selected vehicles for those who demand excellence.</p>
            </div>
            <Link to="/cars" className="text-blue-500 font-medium hover:text-blue-400 flex items-center gap-2 group transition-colors">
              View Entire Fleet <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCars.map((car, idx) => (
              <Card key={idx} className="bg-card border-border overflow-hidden group hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-md">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                </div>
                <CardHeader className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <CardTitle className="text-2xl font-bold text-foreground">{car.name}</CardTitle>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">${car.pricePerHour}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">per day</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground font-light">
                    <span className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> {car.seats} Seats</span>
                    <span className="flex items-center gap-2"><Car className="w-4 h-4 text-primary" /> {car.transmission}</span>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0">
                  <Button className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 transition-all py-6 font-semibold" onClick={() => navigate("/login")}>
                    Reserve Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
            <div className="col-span-1 md:col-span-1 space-y-8">
              <Link to="/" className="text-2xl font-bold">Rent<span className="text-primary">Car</span></Link>
              <p className="text-muted-foreground text-sm leading-relaxed font-light">
                Redefining the standards of premium vehicle rental through technological innovation and unmatched service quality.
              </p>
            </div>
            <div>
              <h4 className="text-foreground font-bold mb-6">Service</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link to="/cars" className="hover:text-primary transition-colors">Browse Fleet</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Long Term Rental</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Corporate Solutions</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-foreground font-bold mb-6">Support</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link to="#" className="hover:text-primary transition-colors">Center</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Terms of Use</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-foreground font-bold mb-6">Social</h4>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer">
                  <span className="text-xs font-bold font-mono">X</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer">
                  <span className="text-xs font-bold font-mono">I</span>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-xs text-muted-foreground uppercase tracking-widest font-semibold">
            &copy; 2025 RentCar. All Rights Reserved. Engineered for Excellence.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
