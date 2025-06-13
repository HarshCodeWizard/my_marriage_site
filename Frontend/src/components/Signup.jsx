
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useAuth } from '../context/AuthContext';
import "../components/Signup.css";

const Signup = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const storedUser = localStorage.getItem("User");
    if (storedUser) {
      navigate("/");
    }
  }, [navigate]);

  const onSubmit = async (data) => {
    try {
      console.log('Signup payload:', data);
      const response = await fetch("http://localhost:8000/user/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname: data.fullname,
          email: data.email,
          password: data.password,
          role: data.role,
        }),
      });

      const responseData = await response.json();
      console.log('Signup response:', responseData);

      if (response.ok) {
        toast.success("Successfully signed up");

        // Auto-login after signup
        const loginResponse = await fetch("http://localhost:8000/user/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include', // If using sessions
          body: JSON.stringify({
            email: data.email,
            password: data.password,
          }),
        });

        const loginData = await loginResponse.json();
        console.log('Auto-login response:', loginData);

        if (loginResponse.ok) {
          login(loginData.user);
          localStorage.setItem("User", JSON.stringify(loginData.user));
          if (loginData.token) {
            localStorage.setItem("Token", loginData.token); // If using JWT
          }
          navigate(loginData.user.role === 'vendor' ? "/profile" : "/");
        } else {
          toast.error("Auto-login failed. Please log in manually.");
          navigate("/login");
        }
      } else {
        toast.error(responseData.message || "An error occurred during signup");
      }
    } catch (err) {
      console.error('Signup error:', err);
      toast.error("Connection error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <div className="wrapper">
        <div className="title-text">
          <div className="title signup">Signup Form</div>
        </div>
        <div className="form-container">
          <div className="form-inner">
            <form onSubmit={handleSubmit(onSubmit)} className="signup">
              <div className="field">
                <input
                  type="text"
                  placeholder="Full Name"
                  {...register("fullname", {
                    required: "Full name is required",
                  })}
                />
                {errors.fullname && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullname.message}</p>
                )}
              </div>
              <div className="field">
                <input
                  type="email"
                  placeholder="Email Address"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
              <div className="field">
                <input
                  type="password"
                  placeholder="Password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>
              <div className="field">
                <select
                  {...register("role", {
                    required: "Role is required",
                  })}
                >
                  <option value="">Select Role</option>
                  <option value="customer">Customer</option>
                  <option value="vendor">Vendor</option>
                </select>
                {errors.role && (
                  <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
                )}
              </div>
              <div className="field btn">
                <div className="btn-layer"></div>
                <input type="submit" value="Signup" />
              </div>
              <div className="signup-link">
                Already a member? <Link to="/login">Login now</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup