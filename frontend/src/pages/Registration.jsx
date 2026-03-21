import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { HiOutlineEye, HiOutlineEyeSlash, HiOutlineArrowLeft } from "react-icons/hi2";
import { authDataContext } from "../context/authContext";
import { userDataContext } from "../context/UserContext";
import axios from "axios";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../utils/Firebase";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { toast } from "react-toastify";

const Registration = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { serverUrl } = useContext(authDataContext);
  const { getCurrentUser } = useContext(userDataContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        serverUrl + "/api/auth/registration",
        { name, email, password },
        { withCredentials: true }
      );
      getCurrentUser();
      navigate("/");
      toast.success("Account created successfully");
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const googleSignup = async () => {
    try {
      const response = await signInWithPopup(auth, provider);
      const { displayName: name, email } = response.user;
      await axios.post(
        serverUrl + "/api/auth/googlelogin", 
        { name, email }, 
        { withCredentials: true }
      );
      getCurrentUser();
      navigate("/");
      toast.success("Registration via Google successful");
    } catch (error) {
      toast.error("Google registration failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--background-base)]">
      {/* Left: Image Hero - Hidden on Mobile */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-[var(--background-subtle)]">
        <img 
          src="/auth-hero.png" 
          alt="Premium Fashion" 
          className="absolute inset-0 w-full h-full object-cover animate-in fade-in zoom-in duration-1000"
        />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
        
        <div className="absolute top-12 left-12">
          <Link to="/" className="text-2xl font-black tracking-tighter text-white">
            VELVIERA
          </Link>
        </div>

        <div className="absolute bottom-12 left-12 right-12 text-white p-8 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10">
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Luxury Meets Comfort</h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-md">
            Unlock exclusive access to limited collections, early drops, and personalized style recommendations.
          </p>
        </div>
      </div>

      {/* Right: Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md flex flex-col gap-10 animate-in fade-in slide-in-from-right-8 duration-700">
          {/* Back Button for mobile */}
          <Link to="/" className="md:hidden flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--brand-primary)] w-fit transition-colors">
            <HiOutlineArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Shop</span>
          </Link>

          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-bold tracking-tight text-[var(--text-base)]">Join the circle</h1>
            <p className="text-[var(--text-muted)] text-lg">Create your account to start your journey.</p>
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-6">
            <div className="flex flex-col gap-5">
              <Input 
                label="Full name" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
                className="h-12 text-[var(--text-base)]"
              />
              <Input 
                label="Email address" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="h-12 text-[var(--text-base)]"
              />
              
              <div className="relative">
                <Input 
                  label="Create password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="h-12 pr-12 text-[var(--text-base)]"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[38px] text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors"
                >
                  {showPassword ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full py-4 h-14 text-base font-bold rounded-xl shadow-lg shadow-[var(--brand-primary)]/10">
              {loading ? "Creating your account..." : "Create Account"}
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border-base)]"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                <span className="bg-[var(--background-base)] px-4 text-[var(--text-muted)]">Or join with</span>
              </div>
            </div>

            <Button type="button" variant="secondary" onClick={googleSignup} className="w-full py-4 h-14 flex items-center justify-center gap-3 text-base font-bold border-2 border-[var(--border-base)] hover:bg-[var(--background-subtle)] rounded-xl transition-all">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign up with Google
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)]">
            Already have an account?{" "}
            <Link to="/login" className="font-black text-[var(--brand-primary)] hover:underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registration;
