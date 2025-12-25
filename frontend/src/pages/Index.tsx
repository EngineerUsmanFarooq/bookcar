import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Star, Car, Shield, Zap, ArrowRight, CheckCircle } from "lucide-react";

const Index = () => {
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });
  const [showHero, setShowHero] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showCars, setShowCars] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger animations sequentially
    setTimeout(() => setShowHero(true), 200);
    setTimeout(() => setShowFeatures(true), 600);
    setTimeout(() => setShowCars(true), 1000);
  }, []);

  const featuredCars = [
    {
      id: 1,
      name: "Toyota Camry",
      image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400",
      pricePerHour: 2500,
      seats: 5,
      transmission: "Automatic",
      rating: 4.8,
      features: ["GPS Navigation", "Bluetooth", "Air Conditioning"]
    },
    {
      id: 2,
      name: "BMW X5",
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400",
      pricePerHour: 4500,
      seats: 7,
      transmission: "Automatic",
      rating: 4.9,
      features: ["Premium Sound", "Leather Seats", "All-Wheel Drive"]
    },
    {
      id: 3,
      name: "Mercedes C-Class",
      image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=400",
      pricePerHour: 3500,
      seats: 5,
      transmission: "Automatic",
      rating: 4.7,
      features: ["Luxury Interior", "Advanced Safety", "Heated Seats"]
    }
  ];

  const handleBrowseCars = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="relative">
                  <img src="/Logo.jpg" alt="Logo" className="h-12 w-12 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">RentCar</span>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/cars" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300 relative group">
                Browse Cars
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300 relative group">
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300 relative group">
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </nav>
            <div className="flex space-x-4">
              <Link to="/login">
                <Button variant="outline" className="bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white/90 transition-all duration-300">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${showHero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/20 mb-8">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Premium Car Rental Service</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-6 leading-tight">
              Rent the Perfect Car for Your Journey
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Choose from our wide selection of premium vehicles. Affordable rates, reliable service, and flexible booking options with 24/7 support.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Button
                size="lg"
                className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
                onClick={handleBrowseCars}
              >
                <Car className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Browse Cars
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              <Link to="/register">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  Get Started Free
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">500+</div>
                <div className="text-gray-600">Premium Cars</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">10K+</div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">50+</div>
                <div className="text-gray-600">Locations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">24/7</div>
                <div className="text-gray-600">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-1000 ${showFeatures ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Why Choose RentCar?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the difference with our premium car rental services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className={`group relative overflow-hidden bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${showFeatures ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="text-center relative z-10">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Car className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Premium Fleet</CardTitle>
              </CardHeader>
              <CardContent className="text-center relative z-10">
                <CardDescription className="text-gray-600 mb-4">
                  Well-maintained vehicles from top brands including luxury SUVs, sedans, and sports cars
                </CardDescription>
                <div className="flex justify-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">Latest Models</span>
                </div>
              </CardContent>
            </Card>

            <Card className={`group relative overflow-hidden bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${showFeatures ? 'animate-fade-in-up animation-delay-200' : 'opacity-0'}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="text-center relative z-10">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">24/7 Service</CardTitle>
              </CardHeader>
              <CardContent className="text-center relative z-10">
                <CardDescription className="text-gray-600 mb-4">
                  Round-the-clock customer support with roadside assistance and emergency services
                </CardDescription>
                <div className="flex justify-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">Always Available</span>
                </div>
              </CardContent>
            </Card>

            <Card className={`group relative overflow-hidden bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${showFeatures ? 'animate-fade-in-up animation-delay-400' : 'opacity-0'}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="text-center relative z-10">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Best Rates</CardTitle>
              </CardHeader>
              <CardContent className="text-center relative z-10">
                <CardDescription className="text-gray-600 mb-4">
                  Competitive pricing with no hidden fees, special discounts, and loyalty programs
                </CardDescription>
                <div className="flex justify-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">No Hidden Costs</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-1000 ${showCars ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Featured Vehicles
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our most popular and highly-rated vehicles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCars.map((car, index) => (
              <Card key={car.id} className={`group relative overflow-hidden bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-105 ${showCars ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: `${index * 200}ms` }}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="aspect-video overflow-hidden relative">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1 shadow-lg">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{car.rating}</span>
                  </div>
                </div>
                <CardHeader className="relative z-10">
                  <CardTitle className="flex justify-between items-center text-lg">
                    {car.name}
                    <div className="text-right">
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ${car.pricePerHour}
                      </div>
                      <div className="text-sm text-gray-500">per hour</div>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {car.seats} seats
                      </span>
                      <span className="flex items-center">
                        <Car className="h-4 w-4 mr-1" />
                        {car.transmission}
                      </span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {car.features.map((feature, idx) => (
                      <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <Link to="/login">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 group">
                      Book Now
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <img src="/Logo.jpg" alt="Logo" className="h-12 w-12 rounded-lg" />
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">RentCar</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Your trusted car rental partner offering premium vehicles, exceptional service, and unforgettable journeys since 2020.
              </p>
              <div className="flex space-x-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-full p-3 hover:bg-white/20 transition-colors duration-300 cursor-pointer">
                  <span className="text-white font-semibold">FB</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-full p-3 hover:bg-white/20 transition-colors duration-300 cursor-pointer">
                  <span className="text-white font-semibold">IG</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-full p-3 hover:bg-white/20 transition-colors duration-300 cursor-pointer">
                  <span className="text-white font-semibold">TW</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">Services</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors duration-300 cursor-pointer">Car Rental</li>
                <li className="hover:text-white transition-colors duration-300 cursor-pointer">Long-term Lease</li>
                <li className="hover:text-white transition-colors duration-300 cursor-pointer">Driver Service</li>
                <li className="hover:text-white transition-colors duration-300 cursor-pointer">Airport Transfer</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors duration-300 cursor-pointer">Help Center</li>
                <li className="hover:text-white transition-colors duration-300 cursor-pointer">Contact Us</li>
                <li className="hover:text-white transition-colors duration-300 cursor-pointer">Terms of Service</li>
                <li className="hover:text-white transition-colors duration-300 cursor-pointer">Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 RentCar. All rights reserved. Made with ❤️ for amazing journeys.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
