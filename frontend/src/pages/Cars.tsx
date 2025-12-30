import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Star, Search, Filter, ArrowLeft, Clock } from "lucide-react";
import { carsAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import CarLoader from "@/components/ui/CarLoader";

const Cars = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [user, setUser] = useState(null);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const data = await carsAPI.getAll();
        setCars(data);
      } catch (error) {
        toast({
          title: "Error loading cars",
          description: error.message || "Failed to load cars",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const categories = [
    { value: "all", label: "All Cars" },
    { value: "compact", label: "Compact" },
    { value: "sedan", label: "Sedan" },
    { value: "suv", label: "SUV" },
    { value: "luxury", label: "Luxury" },
    { value: "sports", label: "Sports" }
  ];

  const filteredCars = cars.filter(car => {
    const matchesSearch = car.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || car.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <CarLoader className="mb-6" />
          <p className="text-muted-foreground text-lg">Loading fleet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/Logo.jpg" alt="Logo" className="h-12 w-12 rounded shadow-sm" />
            </Link>
          </div>
          {user && (
            <Link to="/dashboard">
              <Button variant="outline" className="border-border hover:bg-secondary">My Bookings</Button>
            </Link>
          )}
        </div>

        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search premium cars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 border-border bg-card"
            />
          </div>
          <div className="flex space-x-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className="h-11 px-6 font-semibold"
            >
              All
            </Button>
            {categories.slice(1).map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.value)}
                className="h-11 px-6 font-semibold"
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
            <Card key={car._id} className="bg-card border-border overflow-hidden group hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-md">
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={car.image}
                  alt={car.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {car.available === 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Badge variant="destructive">Not Available</Badge>
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-xl font-bold">
                  {car.name}
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="text-sm font-bold">4.8</span>
                  </div>
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground font-medium">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-primary" />
                      {car.seats} seats
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {car.transmission}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {car.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-[10px] bg-secondary text-muted-foreground border-transparent px-2 py-0">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center pt-2">
                  <div>
                    <p className="text-2xl font-black text-foreground tracking-tighter">${car.pricePerHour}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">per hour</p>
                  </div>
                  {user ? (
                    <Link to={`/book/${car._id}`}>
                      <Button disabled={car.available === 0} className="bg-primary hover:bg-primary/90 text-white shadow-sm px-6">
                        Book Now
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" onClick={() => navigate('/login')}>
                      Login to Book
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredCars.length === 0 && (
            <Card className="col-span-full border-dashed border-2 bg-secondary/10">
              <CardContent className="text-center py-16">
                <div className="text-muted-foreground mx-auto mb-4">
                  <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <path d="M12 6v6l4 2" strokeWidth="2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No vehicles found</h3>
                <p className="text-muted-foreground">Adjust your search or filter to find your perfect car.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cars;
