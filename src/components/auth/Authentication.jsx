import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import loginImg from "/login.jpeg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../../configs/FirebaseConfig";
import { Eye, EyeClosed } from "lucide-react";

function AuthPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields", {
        position: "top-right",
        autoClose: 1500,
      });
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.", {
        position: "top-right",
        autoClose: 1500,
      });
      return;
    }

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Account created successfully!", {
          position: "top-right",
          autoClose: 1500,
        });
      } else {
        const user = await signInWithEmailAndPassword(auth, email, password);
        toast.success(`Welcome back, ${user.user.email}!`, {
          position: "top-right",
          autoClose: 1500,
        });
      }

      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error("Auth Error:", err);

      let errorMessage = "Authentication failed. Please try again.";
      switch (err.code) {
        case "auth/email-already-in-use":
          errorMessage = "This email is already registered.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email format.";
          break;
        case "auth/user-not-found":
        case "auth/wrong-password":
          errorMessage = "Incorrect email or password.";
          break;
        case "auth/weak-password":
          errorMessage = "Password must be at least 6 characters.";
          break;
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 1500,
      });
    }
  };

  const handleGoogleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        toast.success(`Signed in as ${result.user.displayName}`, {
          position: "top-right",
          autoClose: 1500,
        });
        setTimeout(() => navigate("/dashboard"), 1000);
      })
      .catch((err) => {
        console.error("Google Sign-in Error:", err);
        toast.error("Google Sign-in Failed", {
          position: "top-right",
          autoClose: 1500,
        });
      });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Image */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="hidden md:flex items-center justify-center bg-indigo-100"
        >
          <img
            src={loginImg}
            alt="Login Visual"
            className="w-full h-full object-cover hover:scale-105 transition-all duration-500"
          />
        </motion.div>

        {/* Right Form */}
        <div className="w-full p-8 flex flex-col justify-center items-center">
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
              {isSignUp ? "Create an Account" : "Sign In"}
            </h2>
            <p className="text-gray-600 text-center mb-6">
              {isSignUp
                ? "Sign up with your email or use Google"
                : "Login using your email or Google account"}
            </p>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-2 text-gray-500"
                  >
                    {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary text-white">
                {isSignUp ? "Sign Up" : "Continue"}
              </Button>
            </form>

            <div className="flex items-center justify-center my-4">
              <span className="text-gray-400">or</span>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full font-medium text-md"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="google"
                className="w-5 h-5 mr-2"
              />
              {isSignUp ? "Sign up with Google" : "Sign in with Google"}
            </Button>

            <p className="mt-6 text-center text-sm text-gray-600">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-indigo-600 font-medium hover:underline ml-1"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </motion.div>
          <ToastContainer />
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
