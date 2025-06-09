import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, userId } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState({
    hotels: [],
    caterers: [],
    decorators: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || userId === 'null' || userId === 'undefined') {
      toast.error('Please log in to view your profile.');
      setTimeout(() => navigate('/login'), 1000);
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/user/bookings/${userId}`, {
          withCredentials: true,
        });
        setBookings(response.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load bookings.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId, navigate]);

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:8000/user/logout', { withCredentials: true });
      localStorage.removeItem('User');
      toast.success('Logged out successfully');
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Failed to log out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
        <div className="text-2xl text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          <img
            src={user?.picture || 'https://via.placeholder.com/150'}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-md object-cover"
            onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
          />
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{user?.fullname || 'User'}</h1>
            <p className="text-gray-600 mb-1">{user?.email || 'No email available'}</p>
            <button
              onClick={handleLogout}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Bookings</h2>

          {/* Hotels */}
          <div className="mb-8">
            <h3 className="text-xl font-medium text-gray-700 mb-4">Hotels</h3>
            {bookings.hotels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookings.hotels.map((booking, index) => (
                  <div key={index} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition duration-300">
                    <h4 className="text-lg font-semibold text-gray-800">{booking.name}</h4>
                    <p className="text-gray-600">Date: {new Date(booking.date).toLocaleDateString()}</p>
                    <p className="text-gray-600">Price: ₹{booking.price}</p>
                    <p className={`text-sm font-medium ${booking.status === 'confirmed' ? 'text-green-500' : 'text-yellow-500'}`}>
                      Status: {booking.status}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hotel bookings yet.</p>
            )}
          </div>

          {/* Caterers */}
          <div className="mb-8">
            <h3 className="text-xl font-medium text-gray-700 mb-4">Caterers</h3>
            {bookings.caterers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookings.caterers.map((booking, index) => (
                  <div key={index} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition duration-300">
                    <h4 className="text-lg font-semibold text-gray-800">{booking.name}</h4>
                    <p className="text-gray-600">Date: {new Date(booking.date).toLocaleDateString()}</p>
                    <p className="text-gray-600">Price: ₹{booking.price}</p>
                    <p className={`text-sm font-medium ${booking.status === 'confirmed' ? 'text-green-500' : 'text-yellow-500'}`}>
                      Status: {booking.status}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No caterer bookings yet.</p>
            )}
          </div>

          {/* Decorators */}
          <div>
            <h3 className="text-xl font-medium text-gray-700 mb-4">Decorators</h3>
            {bookings.decorators.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookings.decorators.map((booking, index) => (
                  <div key={index} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition duration-300">
                    <h4 className="text-lg font-semibold text-gray-800">{booking.name}</h4>
                    <p className="text-gray-600">Date: {new Date(booking.date).toLocaleDateString()}</p>
                    <p className="text-gray-600">Price: ₹{booking.price}</p>
                    <p className={`text-sm font-medium ${booking.status === 'confirmed' ? 'text-green-500' : 'text-yellow-500'}`}>
                      Status: {booking.status}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No decorator bookings yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;