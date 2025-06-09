import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

function Navbar() {
  const [sticky, setSticky] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const timeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('User');
    setIsLoggedIn(!!user);

    const handleScroll = () => {
      setSticky(window.scrollY > 0);
    };

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSubmenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsDropdownOpen(true);
    setSubmenuOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setSubmenuOpen(false);
      if (!dropdownRef.current.contains(document.activeElement)) {
        setIsDropdownOpen(false);
      }
    }, 200);
  };

  const toggleServices = (e) => {
    e.preventDefault();
    setSubmenuOpen(!submenuOpen);
    setIsDropdownOpen(true);
  };

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:8000/user/logout', { withCredentials: true });
      localStorage.removeItem('User');
      setIsLoggedIn(false);
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <div className={`navbar-container ${sticky ? "sticky-navbar shadow-md bg-base-500 duration-300 transition-all ease-in-out" : ""}`}>
      <div
        className="navbar bg-base-100 bg-black bg-opacity-50 border rounded-xl mx-4 my-2"
        style={{
          backgroundImage: `url(/header-bg.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: '100px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div className="navbar-start">
          <div className="dropdown" ref={dropdownRef}>
            <div tabIndex={0} role="button" className="btn btn-circle bg-white btn-sm" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className={`menu menu-sm dropdown-content bg-white rounded-lg z-[1] mt-3 w-56 p-3 shadow-lg border border-gray-200 ${
                isDropdownOpen ? 'block' : 'hidden'
              }`}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <li>
                <Link 
                  to="/" 
                  className="block py-2 px-4 text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 font-medium"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/portfolio" 
                  className="block py-2 px-4 text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 font-medium"
                >
                  Portfolio
                </Link>
              </li>
              <li className="relative">
                <div 
                  className="flex items-center justify-between cursor-pointer py-2 px-4 text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 font-medium"
                  onClick={toggleServices}
                  onMouseEnter={() => setSubmenuOpen(true)}
                >
                  Services
                  <svg
                    className={`w-4 h-4 ml-2 transition-transform duration-200 ${submenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                {submenuOpen && (
                  <ul 
                    className="absolute left-0 top-full bg-gray-800 rounded-lg mt-2 w-48 p-3 shadow-lg z-10 transform transition-opacity duration-300"
                    onMouseEnter={() => setSubmenuOpen(true)}
                    onMouseLeave={() => setSubmenuOpen(false)}
                  >
                    <li>
                      <Link 
                        to="/hotels" 
                        className="block py-2 px-4 text-gray-200 hover:bg-gray-700 rounded-lg transition-colors duration-200 font-medium"
                      >
                        Hotels
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/caterers" 
                        className="block py-2 px-4 text-gray-200 hover:bg-gray-700 rounded-lg transition-colors duration-200 font-medium"
                      >
                        Caterers
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/performers" 
                        className="block py-2 px-4 text-gray-200 hover:bg-gray-700 rounded-lg transition-colors duration-200 font-medium"
                      >
                        Performers
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/decorators" 
                        className="block py-2 px-4 text-gray-200 hover:bg-gray-700 rounded-lg transition-colors duration-200 font-medium"
                      >
                        Decorators
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="block py-2 px-4 text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 font-medium"
                >
                  About
                </Link>
              </li>
              {isLoggedIn && (
                <li>
                  <Link 
                    to="/profile" 
                    className="block py-2 px-4 text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 font-medium"
                  >
                    Profile
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="navbar-center">
          <a className="btn btn-ghost text-xl text-white">LoveLockedIn</a>
        </div>

        <div className="navbar-end flex items-center space-x-2">
          <button className="btn btn-circle btn-sm bg-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
          <button className="btn btn-circle btn-sm bg-white">
            <div className="indicator">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="badge badge-xs badge-primary indicator-item"></span>
            </div>
          </button>
          {isLoggedIn ? (
            <>
              <Link
                to="/profile"
                className="bg-blue-600 px-3 py-1 text-white font-semibold rounded-full text-sm hover:bg-blue-700 transition duration-300"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-3 py-1 text-white font-semibold rounded-full text-sm hover:bg-red-600 transition duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-gray-700 px-3 py-1 text-white font-semibold rounded-full text-sm hover:bg-gray-800 transition duration-300"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;