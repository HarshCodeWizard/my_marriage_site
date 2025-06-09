import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../components/CatererDetails.css';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CatererDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caterer, setCaterer] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const { userId, user } = useAuth();

  useEffect(() => {
    const fetchCatererDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/caterers/${id}`);
        setCaterer(response.data);
      } catch (error) {
        console.error('Error fetching caterer details:', error);
        toast.error('Failed to load caterer details.');
      } finally {
        setLoading(false);
      }
    };
    fetchCatererDetails();
  }, [id]);

  useEffect(() => {
    if (socket) {
      socket.on('bookingUpdate', (data) => {
        console.log('Booking update received:', data);
        toast.success(data.message);
        if (data.status === 'confirmed') {
          setTimeout(() => navigate('/profile'), 2000);
        }
      });
      return () => socket.off('bookingUpdate');
    }
  }, [socket, navigate]);

  const handlePay = async () => {
    console.log('Pay button clicked, userId:', userId, 'catererId:', id);
    if (!userId || userId === 'null' || userId === 'undefined') {
      console.log('No valid userId, redirecting');
      toast.error('Please log in to book a caterer.');
      setTimeout(() => navigate('/login'), 1000);
      return;
    }

    try {
      console.log('Sending booking request:', { userId, catererId: id, date: new Date().toISOString() });
      const response = await axios.post(
        'http://localhost:8000/caterers/book',
        {
          userId,
          catererId: id,
          date: new Date().toISOString(),
        },
        { withCredentials: true }
      );

      console.log('Booking response:', response.data);
      const { order } = response.data;

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        if (!window.Razorpay) {
          console.error('Razorpay SDK not loaded');
          toast.error('Payment system failed to load. Please try again.');
          return;
        }

        const options = {
          key: import.meta.env.VITE_REACT_APP_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          order_id: order.id,
          name: 'Wedding Planner',
          description: `Booking for ${caterer?.name || 'Caterer'}`,
          handler: async (response) => {
            try {
              console.log('Payment response:', response);
              await axios.post(
                'http://localhost:8000/verify-payment',
                {
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  signature: response.razorpay_signature,
                },
                { withCredentials: true }
              );
              toast.success('Payment successful!');
              setTimeout(() => navigate('/profile'), 2000);
            } catch (error) {
              console.error('Payment verification error:', error);
              toast.error('Payment verification failed.');
            }
          },
          prefill: {
            name: user?.fullname || 'Guest',
            email: user?.email || '',
          },
          theme: { color: '#6e8efb' },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response) => {
          console.error('Payment failed:', response.error);
          toast.error('Payment failed. Please try again.');
        });
        rzp.open();
      };

      script.onerror = () => {
        console.error('Failed to load Razorpay SDK');
        toast.error('Failed to load payment system. Please try again.');
      };
    } catch (error) {
      console.error('Error initiating booking:', error.response?.data?.error || error.message);
      toast.error(
        error.response?.data?.details || 'Failed to initiate booking. Please try again.'
      );
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!caterer) return <div className="not-found">Caterer not found</div>;

  const position = [
    caterer.latitude || caterer.location?.coordinates[1] || 0,
    caterer.longitude || caterer.location?.coordinates[0] || 0,
  ];

  return (
    <div className="caterer-details-container">
      <div className="header-section">
        <h1 className="caterer-name">{caterer.name}</h1>
        <p className="caterer-title">{caterer.title}</p>
        <p className="caterer-category">Category: {caterer.category}</p>
        <div className="price-section">
          <span className="price-label">Price:</span>
          <span className="price-value">₹{caterer.price}</span>
        </div>
      </div>
      <div className="gallery-section">
        <h2 className="gallery-title">Related Caterer Images</h2>
        <div className="gallery">
          {caterer.subImages && caterer.subImages.length > 0 ? (
            caterer.subImages.map((image, index) => (
              <div className="gallery-item" key={index}>
                <img
                  src={image.startsWith('/') ? image : `/${image}`}
                  alt={`Caterer Image ${index + 1}`}
                  onError={(e) => (e.target.src = '/images/fallback.jpg')}
                />
              </div>
            ))
          ) : (
            <p>No related images available.</p>
          )}
        </div>
      </div>
      <div className="image-section">
        <img
          className="caterer-image"
          src={caterer.image.startsWith('/') ? caterer.image : `/${caterer.image}`}
          alt={caterer.name}
          onError={(e) => (e.target.src = '/images/fallback.jpg')}
        />
      </div>
      <div className="map-section">
        <h2 className="map-title">Location</h2>
        <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={position}>
            <Popup>{caterer.address}</Popup>
          </Marker>
        </MapContainer>
      </div>
      <div className="payment-section">
        <h2 className="payment-title">Proceed to Payment</h2>
        <div className="payment-box">
          <button
            className="pay-button"
            onClick={() => {
              console.log('Pay Now button clicked, userId:', userId);
              handlePay();
            }}
          >
            Book and Pay Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CatererDetails;