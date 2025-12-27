import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, Globe, MessageCircle } from "lucide-react";

const Contact = () => {
  return (
    <div className="dark min-h-screen bg-[#0F0F0F] text-white py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Have questions? We're here to help. Get in touch with us through any of these channels.
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Contact Information */}
          <Card className="bg-[#161616] border-white/5 border shadow-2xl">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription className="text-gray-400">
                Get in touch with us through any of these channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Mail className="w-6 h-6 text-blue-500" />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-gray-400">support@carrental.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Phone className="w-6 h-6 text-green-500" />
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <p className="text-gray-400">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <MapPin className="w-6 h-6 text-red-500" />
                <div>
                  <h3 className="font-semibold">Address</h3>
                  <p className="text-gray-400">
                    123 Car Rental Street<br />
                    New York, NY 10001
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Clock className="w-6 h-6 text-purple-500" />
                <div>
                  <h3 className="font-semibold">Business Hours</h3>
                  <p className="text-gray-400">
                    Monday - Friday: 9:00 AM - 6:00 PM<br />
                    Saturday: 10:00 AM - 4:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                More ways to connect with us
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Globe className="w-6 h-6 text-indigo-600" />
                <div>
                  <h3 className="font-semibold">Website</h3>
                  <p className="text-gray-600">/</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <MessageCircle className="w-6 h-6 text-pink-600" />
                <div>
                  <h3 className="font-semibold">Social Media</h3>
                  <p className="text-gray-600">
                    Facebook: @CarRental<br />
                    Twitter: @CarRental<br />
                    Instagram: @CarRental
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