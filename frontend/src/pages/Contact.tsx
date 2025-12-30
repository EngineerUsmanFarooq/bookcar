import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, Globe, MessageCircle } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black tracking-tight mb-4">Contact Relations</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
            Dedicated to providing seamless assistance. Reach out to our global support network for any inquiries.
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Contact Information */}
          <Card className="bg-card border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-secondary/30 border-b border-border">
              <CardTitle className="font-bold">Contact Matrix</CardTitle>
              <CardDescription className="text-muted-foreground font-medium">
                Official communication channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Mail className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-bold text-foreground">Global Support</h3>
                  <p className="text-muted-foreground">relations@rentcar.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Phone className="w-6 h-6 text-success" />
                <div>
                  <h3 className="font-bold text-foreground">Direct Line</h3>
                  <p className="text-muted-foreground">+1 (555) RENT-CAR</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <MapPin className="w-6 h-6 text-red-500" />
                <div>
                  <h3 className="font-bold text-foreground">Headquarters</h3>
                  <p className="text-muted-foreground">
                    Silicon Valley Tech Plaza<br />
                    California, CA 94025
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Clock className="w-6 h-6 text-indigo-500" />
                <div>
                  <h3 className="font-bold text-foreground">Operational Hours</h3>
                  <p className="text-muted-foreground">
                    24/7 Concierge Availability for Active Bookings<br />
                    Office: Mon-Fri 09:00 - 18:00
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Contact Information */}
          <Card className="bg-card border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-secondary/30 border-b border-border">
              <CardTitle className="font-bold">Operational Matrix</CardTitle>
              <CardDescription className="text-muted-foreground font-medium">
                Global availability protocols
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Globe className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-bold text-foreground">Digital Infrastructure</h3>
                  <p className="text-muted-foreground font-medium">fleet.rentcar.mobility</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <MessageCircle className="w-6 h-6 text-pink-500" />
                <div>
                  <h3 className="font-bold text-foreground">Global Concierge</h3>
                  <p className="text-muted-foreground font-medium">
                    @RentCarGlobal
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact; 