import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import Chat from "./Chat";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Star, DollarSign, MessageCircle, Utensils } from "lucide-react";

const CatererDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caterer, setCaterer] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const { userId, user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("veg");

  useEffect(() => {
    const fetchCatererDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/caterers/${id}`);
        setCaterer(response.data);
      } catch (error) {
        console.error("Error fetching caterer details:", error);
        toast.error("Failed to load caterer details.");
      } finally {
        setLoading(false);
      }
    };
    fetchCatererDetails();
  }, [id]);

  useEffect(() => {
    if (socket) {
      socket.on("bookingUpdate", (data) => {
        console.log("Booking update received:", data);
        toast.success(data.message);
        if (data.status === "confirmed") {
          setTimeout(() => navigate("/profile"), 2000);
        }
      });
      return () => socket.off("bookingUpdate");
    }
  }, [socket, navigate]);

  const handlePay = async () => {
    if (!userId || userId === "null" || userId === "undefined") {
      toast.error("Please log in to book a caterer.");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/caterers/book",
        {
          userId,
          catererId: id,
          date: new Date().toISOString(),
        },
        { withCredentials: true }
      );

      const { order } = response.data;

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        if (!window.Razorpay) {
          toast.error("Payment system failed to load. Please try again.");
          return;
        }

        const options = {
          key: import.meta.env.VITE_REACT_APP_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          order_id: order.id,
          name: "Wedding Planner",
          description: `Booking for ${caterer?.name || "Caterer"}`,
          handler: async (response) => {
            try {
              await axios.post(
                "http://localhost:8000/verify-payment",
                {
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  signature: response.razorpay_signature,
                },
                { withCredentials: true }
              );
              toast.success("Payment successful!");
              setTimeout(() => navigate("/profile"), 2000);
            } catch (error) {
              toast.error("Payment verification failed.");
            }
          },
          prefill: {
            name: user?.fullname || "Guest",
            email: user?.email || "",
          },
          theme: { color: "#FF4E8E" },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response) => {
          toast.error("Payment failed. Please try again.");
        });
        rzp.open();
      };
    } catch (error) {
      toast.error("Failed to initiate booking. Please try again.");
    }
  };

  const nextImage = () => {
    if (caterer?.subImages?.length) {
      setCurrentImageIndex((prev) => (prev + 1) % caterer.subImages.length);
    }
  };

  const prevImage = () => {
    if (caterer?.subImages?.length) {
      setCurrentImageIndex((prev) => (prev - 1 + caterer.subImages.length) % caterer.subImages.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-50 to-amber-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-xl font-medium text-gray-700">Loading caterer details...</p>
        </div>
      </div>
    );
  }

  if (!caterer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-50 to-amber-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Caterer Not Found</h2>
          <p className="text-gray-600 mb-6">The caterer you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate("/caterers")}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Browse All Caterers
          </button>
        </div>
      </div>
    );
  }

  const position = [
    caterer.latitude || caterer.location?.coordinates[1] || 0,
    caterer.longitude || caterer.location?.coordinates[0] || 0,
  ];

  // Sample menu items (since they're not in the original data)
  const menuItems = {
    veg: [
      { name: "Paneer Butter Masala", description: "Cottage cheese cubes in a rich tomato and butter gravy" },
      { name: "Vegetable Biryani", description: "Fragrant rice dish with mixed vegetables and aromatic spices" },
      { name: "Dal Makhani", description: "Creamy black lentils slow-cooked with butter and spices" },
      { name: "Palak Paneer", description: "Cottage cheese cubes in a spinach gravy" },
    ],
    nonVeg: [
      { name: "Butter Chicken", description: "Tender chicken pieces in a rich tomato and butter gravy" },
      { name: "Chicken Biryani", description: "Fragrant rice dish with chicken and aromatic spices" },
      { name: "Mutton Rogan Josh", description: "Slow-cooked mutton in a rich Kashmiri gravy" },
      { name: "Fish Curry", description: "Fresh fish cooked in a tangy coconut curry" },
    ],
    desserts: [
      { name: "Gulab Jamun", description: "Deep-fried milk solids soaked in sugar syrup" },
      { name: "Rasmalai", description: "Soft cottage cheese dumplings in sweetened milk" },
      { name: "Kheer", description: "Rice pudding with nuts and cardamom" },
      { name: "Jalebi", description: "Crispy, syrupy sweet made from fermented batter" },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-orange-50 to-amber-50 py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate("/caterers")}
          className="flex items-center text-orange-600 hover:text-orange-800 mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to all caterers
        </button>

        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-10"
        >
          <div className="relative h-96 sm:h-[500px]">
            <img
              src={caterer.image.startsWith("/") ? caterer.image : `/${caterer.image}`}
              alt={caterer.name}
              className="w-full h-full object-cover"
              onError={(e) => (e.target.src = "/images/fallback.jpg")}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 sm:p-10">
              <div className="flex items-center mb-2">
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {caterer.category || "Premium Caterer"}
                </span>
                <div className="flex items-center ml-4 text-yellow-400">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                </div>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2">{caterer.name}</h1>
              <p className="text-lg sm:text-xl text-white/90">{caterer.title || "Exquisite Catering Services"}</p>
            </div>
          </div>
        </motion.div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left column - Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Price and booking */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Caterer Details</h2>
                  <div className="flex items-center mt-2">
                    <MapPin className="w-5 h-5 text-orange-500 mr-2" />
                    <span className="text-gray-600">{caterer.address || "Location details unavailable"}</span>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0">
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-3xl font-bold text-gray-800">₹{caterer.price}</span>
                  </div>
                  <p className="text-sm text-gray-500">per plate</p>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                {caterer.description ||
                  "Delight your guests with our exquisite culinary creations. We specialize in creating memorable dining experiences with fresh ingredients and artistic presentation."}
              </p>

              <button
                onClick={handlePay}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <Utensils className="w-5 h-5 mr-2" />
                Book This Caterer Now
              </button>
            </div>

            {/* Menu */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Sample Menu</h2>

              <div className="flex border-b mb-6">
                <button
                  className={`px-4 py-2 font-medium ${selectedMenu === "veg" ? "text-orange-600 border-b-2 border-orange-600" : "text-gray-600 hover:text-orange-600"}`}
                  onClick={() => setSelectedMenu("veg")}
                >
                  Vegetarian
                </button>
                <button
                  className={`px-4 py-2 font-medium ${selectedMenu === "nonVeg" ? "text-orange-600 border-b-2 border-orange-600" : "text-gray-600 hover:text-orange-600"}`}
                  onClick={() => setSelectedMenu("nonVeg")}
                >
                  Non-Vegetarian
                </button>
                <button
                  className={`px-4 py-2 font-medium ${selectedMenu === "desserts" ? "text-orange-600 border-b-2 border-orange-600" : "text-gray-600 hover:text-orange-600"}`}
                  onClick={() => setSelectedMenu("desserts")}
                >
                  Desserts
                </button>
              </div>

              <div className="space-y-4">
                {menuItems[selectedMenu].map((item, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-100 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-800">{item.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-sm text-gray-500 italic">
                Note: This is a sample menu. The caterer can customize the menu based on your preferences and dietary
                requirements.
              </p>
            </div>

            {/* Gallery */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Food Gallery</h2>

              {caterer.subImages && caterer.subImages.length > 0 ? (
                <div className="relative">
                  <div className="overflow-hidden rounded-lg h-80">
                    <img
                      src={
                        caterer.subImages[currentImageIndex].startsWith("/")
                          ? caterer.subImages[currentImageIndex]
                          : `/${caterer.subImages[currentImageIndex]}`
                      }
                      alt={`Food Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      onError={(e) => (e.target.src = "/images/fallback.jpg")}
                    />
                  </div>

                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                  </button>

                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-800" />
                  </button>

                  <div className="flex justify-center mt-4 gap-2">
                    {caterer.subImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentImageIndex ? "bg-orange-500" : "bg-gray-300 hover:bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <p className="text-gray-500">No gallery images available</p>
                </div>
              )}

              <div className="grid grid-cols-4 gap-2 mt-4">
                {caterer.subImages &&
                  caterer.subImages
                    .slice(0, 4)
                    .map((image, index) => (
                      <img
                        key={index}
                        src={image.startsWith("/") ? image : `/${image}`}
                        alt={`Thumbnail ${index + 1}`}
                        className={`h-20 w-full object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity ${
                          index === currentImageIndex ? "ring-2 ring-orange-500" : ""
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                        onError={(e) => (e.target.src = "/images/fallback.jpg")}
                      />
                    ))}
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Location</h2>
              <div className="h-80 rounded-lg overflow-hidden">
                <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={position}>
                    <Popup>{caterer.address || caterer.name}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          </motion.div>

          {/* Right column - Chat and info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-8"
          >
            {/* Chat toggle */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Have Questions?</h2>
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="flex items-center text-orange-500 hover:text-orange-700 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 mr-1" />
                  {showChat ? "Hide Chat" : "Open Chat"}
                </button>
              </div>

              {showChat ? (
                <Chat itemId={id} itemType="Caterer" />
              ) : (
                <div className="bg-orange-50 rounded-lg p-6 text-center">
                  <p className="text-gray-700 mb-4">
                    Chat with the caterer to ask questions about menu options, dietary restrictions, or special
                    requirements.
                  </p>
                  <button
                    onClick={() => setShowChat(true)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Start Chat
                  </button>
                </div>
              )}
            </div>

            {/* Specialties */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Specialties</h2>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  North Indian Cuisine
                </li>
                <li className="flex items-center text-gray-700">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  South Indian Delicacies
                </li>
                <li className="flex items-center text-gray-700">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Continental Options
                </li>
                <li className="flex items-center text-gray-700">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Customized Menu Planning
                </li>
                <li className="flex items-center text-gray-700">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Live Cooking Stations
                </li>
              </ul>
            </div>

            {/* Reviews summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Reviews</h2>
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 mr-2">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <span className="text-gray-700">5.0 (18 reviews)</span>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-gray-800">Ananya K.</span>
                    <div className="flex text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">
                    "The food was absolutely delicious! Our guests couldn't stop raving about it."
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-gray-800">Vikram S.</span>
                    <div className="flex text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">
                    "Professional service and amazing food. They accommodated all our dietary requirements."
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CatererDetails;