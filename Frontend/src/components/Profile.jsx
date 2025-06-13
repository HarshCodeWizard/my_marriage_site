import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-hot-toast";
import Chat from "./Chat";
import { motion } from "framer-motion";
import {
  User,
  LogOut,
  Calendar,
  MapPin,
  MessageCircle,
  Hotel,
  Utensils,
  Palette,
  Clock,
  Star,
  Phone,
  Mail,
  Settings,
  Bell,
  CreditCard,
  Heart,
} from "lucide-react";

const Profile = () => {
  const { user, userId, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState({ hotels: [], caterers: [], decorators: [] });
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [activeTab, setActiveTab] = useState("bookings");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || userId === "null" || userId === "undefined") {
      toast.error("Please log in to view your profile");
      setLoading(false);
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [bookingsResponse, chatsResponse] = await Promise.all([
          axios.get(`http://localhost:8000/user/bookings/${userId}`, { withCredentials: true }),
          user?.role === "vendor"
            ? axios.get(`http://localhost:8000/chat/history/${userId}`, { withCredentials: true })
            : Promise.resolve({ data: [] }),
        ]);

        setBookings(bookingsResponse.data || { hotels: [], caterers: [], decorators: [] });
        setChats(chatsResponse.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, user?.role, navigate]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const getBookingIcon = (type) => {
    switch (type) {
      case "hotels":
        return <Hotel className="w-6 h-6 text-pink-500" />;
      case "caterers":
        return <Utensils className="w-6 h-6 text-orange-500" />;
      case "decorators":
        return <Palette className="w-6 h-6 text-purple-500" />;
      default:
        return <Calendar className="w-6 h-6 text-gray-500" />;
    }
  };

  const getBookingColor = (type) => {
    switch (type) {
      case "hotels":
        return "from-pink-500 to-rose-500";
      case "caterers":
        return "from-orange-500 to-amber-500";
      case "decorators":
        return "from-purple-500 to-indigo-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const totalBookings = (bookings.hotels?.length || 0) + (bookings.caterers?.length || 0) + (bookings.decorators?.length || 0);
  const totalSpent = [...(bookings.hotels || []), ...(bookings.caterers || []), ...(bookings.decorators || [])].reduce(
    (sum, booking) => sum + (booking.price || 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-xl font-medium text-gray-700">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in to view your profile.</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.fullname}!</h1>
                <p className="text-gray-600 capitalize">{user.role} Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-6 h-6" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-6 h-6" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6"
            >
              {/* Profile Info */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">{user.fullname}</h3>
                <p className="text-gray-600">{user.email}</p>
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mt-2 capitalize">
                  {user.role}
                </span>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <Heart className="w-5 h-5 text-purple-500 mr-2" />
                    <span className="text-gray-700">Total Bookings</span>
                  </div>
                  <span className="font-semibold text-gray-800">{totalBookings}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-700">Total Spent</span>
                  </div>
                  <span className="font-semibold text-gray-800">₹{totalSpent.toLocaleString()}</span>
                </div>
                {user.role === "vendor" && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <MessageCircle className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="text-gray-700">Active Chats</span>
                    </div>
                    <span className="font-semibold text-gray-800">{chats.length}</span>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="mt-6 space-y-2">
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "bookings" ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Calendar className="w-5 h-5 mr-3" />
                  My Bookings
                </button>
                {user.role === "vendor" && (
                  <button
                    onClick={() => setActiveTab("chats")}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "chats" ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <MessageCircle className="w-5 h-5 mr-3" />
                    Customer Chats
                  </button>
                )}
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "profile" ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <User className="w-5 h-5 mr-3" />
                  Profile Settings
                </button>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "bookings" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Bookings</h2>

                  {totalBookings === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-600 mb-2">No bookings yet</h3>
                      <p className="text-gray-500 mb-6">
                        Start planning your perfect wedding by booking venues and services.
                      </p>
                      <button
                        onClick={() => navigate("/")}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all"
                      >
                        Browse Services
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {["hotels", "caterers", "decorators"].map((type) => (
                        <div key={type}>
                          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            {getBookingIcon(type)}
                            <span className="ml-2 capitalize">{type}</span>
                            <span className="ml-2 text-sm text-gray-500">({bookings[type]?.length || 0})</span>
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {bookings[type]?.map((booking, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-all"
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h4 className="font-semibold text-gray-800">{booking.name || "Unknown Service"}</h4>
                                    <p className="text-gray-600 text-sm">{booking.category || "Premium Service"}</p>
                                  </div>
                                  <div
                                    className={`px-3 py-1 bg-gradient-to-r ${getBookingColor(type)} text-white rounded-full text-sm font-medium`}
                                  >
                                    ₹{(booking.price || 0).toLocaleString()}
                                  </div>
                                </div>
                                <div className="flex items-center text-gray-600 text-sm mb-2">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  <span>{booking.address || "Location details unavailable"}</span>
                                </div>
                                <div className="flex items-center text-gray-600 text-sm mb-4">
                                  <Clock className="w-4 h-4 mr-1" />
                                  <span>
                                    Booked on {new Date(booking.bookingDate || Date.now()).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span className="text-sm text-gray-600 ml-1">5.0 Rating</span>
                                  </div>
                                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                    Confirmed
                                  </span>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "chats" && user.role === "vendor" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Chats</h2>

                  {chats.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-600 mb-2">No chats yet</h3>
                      <p className="text-gray-500">Customer conversations will appear here when they contact you.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        {chats.map((chat) => (
                          <motion.div
                            key={chat._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => setSelectedChatId(chat._id)}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                              selectedChatId === chat._id
                                ? "bg-purple-50 border-purple-300"
                                : "bg-white border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-800">
                                {chat.customerId?.fullname || "Unknown Customer"}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {new Date(chat.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {chat.itemType} Service - ID: {chat.itemId}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {chat.messages?.[chat.messages.length - 1]?.content || "No messages yet"}
                            </p>
                          </motion.div>
                        ))}
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        {selectedChatId ? (
                          <Chat
                            itemType={chats.find((chat) => chat._id === selectedChatId)?.itemType}
                            itemId={chats.find((chat) => chat._id === selectedChatId)?.itemId}
                          />
                        ) : (
                          <div className="text-center py-12">
                            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Select a chat to start messaging</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Settings</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <User className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-800">{user.fullname || "Not provided"}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <Mail className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-800">{user.email || "Not provided"}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <User className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-800 capitalize">{user.role || "Unknown"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <Phone className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-500">{user.phone || "Not provided"}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-800">
                            {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all">
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;