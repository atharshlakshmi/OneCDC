import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, Navigation, MapPin, Star } from "lucide-react";
import logo from "@/assets/onecdc_logo.png";

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Search size={32} className="text-amber-500" />,
      title: "Discover Items",
      description: "Search and browse through a wide variety of items available in local CDC shops.",
    },
    {
      icon: <MapPin size={32} className="text-amber-500" />,
      title: "Location-Based Search",
      description: "Find shops closest to you with real-time distance calculations.",
    },
    {
      icon: <ShoppingCart size={32} className="text-amber-500" />,
      title: "Shopping Cart",
      description: "Add multiple shops to your cart and plan your shopping trip efficiently.",
    },
    {
      icon: <Navigation size={32} className="text-amber-500" />,
      title: "Optimized Routes",
      description: "Generate the best route to visit all your selected shops with various transport modes.",
    },
    {
      icon: <Star size={32} className="text-amber-500" />,
      title: "Reviews & Ratings",
      description: "Share your experiences and read reviews from other shoppers.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white py-16 px-6 text-center">
        <img src={logo} alt="OneCDC Logo" className="w-73 h-48 mx-auto mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to OneCDC!</h1>
        <p className="text-xl md:text-2xl font-light max-w-2xl mx-auto">
          Your one-stop platform for discovering and exploring CDC voucher-accepting shops
        </p>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
          What You Can Do
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-amber-50 rounded-full">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* How It Works Section */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
            How It Works
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-400 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  Search for Items
                </h4>
                <p className="text-gray-600">
                  Use our powerful search to find CDC voucher-accepting shops based on items you want to buy. 
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-400 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  Add Shops to Your Cart
                </h4>
                <p className="text-gray-600">
                  Select the shops you want to visit and add them to your shopping cart.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-400 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  Generate Your Route
                </h4>
                <p className="text-gray-600">
                  Get an optimized route that helps you visit all your selected shops efficiently.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-400 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  Share Your Experience
                </h4>
                <p className="text-gray-600">
                  Leave reviews and ratings to help other shoppers make informed decisions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Ready to Start Shopping?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover amazing local shops and start planning your shopping trip today!
          </p>
          <Button
            onClick={() => navigate("/shopSearch")}
            size="lg"
            className="bg-amber-400 hover:bg-amber-500 text-white text-lg px-12 py-6 shadow-lg"
          >
            Start Exploring Shops
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
