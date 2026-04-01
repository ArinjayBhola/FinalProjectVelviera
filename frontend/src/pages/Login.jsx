import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { HiOutlineEye, HiOutlineEyeSlash, HiOutlineArrowLeft } from "react-icons/hi2";
import { authDataContext } from "../context/authContext";
import { userDataContext } from "../context/UserContext";
import axios from "axios";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useModal } from "../context/ModalContext";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { serverUrl } = useContext(authDataContext);
  const { getCurrentUser } = useContext(userDataContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showAlert } = useModal();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        serverUrl + "/api/auth/login",
        { email, password },
        { withCredentials: true }
      );
      getCurrentUser();
      navigate("/");
      showAlert("Welcome Back", "You've successfully signed in to Velviera. Let's find something amazing!", "success");
    } catch (error) {
      showAlert("Login Failed", "The email or password you entered is incorrect. Please try again.", "error");
    } finally {
      setLoading(false);
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
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Elegance in Every Detail</h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-md">
            Step into a world of curated fashion where quality meets minimal design. Join our community of trendsetters today.
          </p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md flex flex-col gap-10 animate-in fade-in slide-in-from-right-8 duration-700">
          {/* Back Button for mobile */}
          <Link to="/" className="md:hidden flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--brand-primary)] w-fit transition-colors">
            <HiOutlineArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Shop</span>
          </Link>

          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-bold tracking-tight text-[var(--text-base)]">Welcome back</h1>
            <p className="text-[var(--text-muted)] text-lg">Enter your details to access your account.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="flex flex-col gap-5">
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
                  label="Password" 
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
              {loading ? "Authenticating..." : "Sign in to Velviera"}
            </Button>


          </form>

          <p className="text-center text-sm text-[var(--text-muted)]">
            New to Velviera?{" "}
            <Link to="/signup" className="font-black text-[var(--brand-primary)] hover:underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
