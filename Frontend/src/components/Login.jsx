import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, User } from "lucide-react";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("User");
    if (storedUser) {
      navigate("/");
    }
  }, [navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success("Successfully logged in");
        login(responseData.user);
        localStorage.setItem("User", JSON.stringify(responseData.user));
        navigate(responseData.user.role === "vendor" ? "/profile" : "/");
      } else {
        toast.error(responseData.message || "An error occurred during login");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:8000/user/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-50 to-indigo-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to continue to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-500" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              placeholder="your.email@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-500" />
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <Link to="/forgot-password" className="text-sm font-medium text-purple-600 hover:text-purple-500">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 rounded-lg text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            >
              <User className="w-5 h-5 mr-2 text-purple-500" />
              Sign in with Google
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-purple-600 hover:text-purple-500">
              Sign up now
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;