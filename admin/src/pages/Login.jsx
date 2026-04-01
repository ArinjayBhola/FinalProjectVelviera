import React, { useContext, useState } from "react";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
import axios from "axios";
import { authDataContext } from "../context/AuthContext";
import { adminDataContext } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { useModal } from '../context/ModalContext';
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import { motion } from "framer-motion";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { serverUrl } = useContext(authDataContext);
  const { getAdmin, setToken } = useContext(adminDataContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { showAlert } = useModal();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${serverUrl}/api/auth/adminlogin`,
        { email, password },
        { withCredentials: true }
      );
      if (response.status === 200 || response.status === 201) {
        setToken(response.data.token);
        showAlert("Welcome Back!", "Successfully logged in to the admin dashboard.", "success");
        getAdmin();
        navigate("/");
      } else {
        showAlert("Login Failed", response.data.message || "Invalid credentials. Please try again.", "error");
      }
    } catch (error) {
      showAlert("Authentication Error", "Something went wrong. Please check your network or try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background-base)] px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[var(--brand-primary)]/5 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-[var(--brand-secondary)]/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card variant="glass" className="p-8 md:p-12">
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-1.5 mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--brand-primary)] bg-[var(--brand-primary)]/5 rounded-full border border-[var(--brand-primary)]/20"
            >
              Velviera • Admin
            </motion.div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-3 bg-gradient-to-br from-[var(--text-base)] to-[var(--text-muted)] bg-clip-text text-transparent">
              Control Panel
            </h1>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Authenticate to access the Velviera management console.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="flex flex-col gap-8">
            <div className="flex flex-col gap-5">
              <Input 
                label="Corporate Email" 
                type="email" 
                placeholder="admin@velviera.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                autoComplete="email"
                className="transition-all focus-within:scale-[1.01]"
              />
              
              <div className="relative group">
                <Input 
                  label="Security Key" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  autoComplete="current-password"
                  className="transition-all focus-within:scale-[1.01]"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-[40px] text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors p-1"
                >
                  {showPassword ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              disabled={loading} 
              className="w-full h-14 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 shadow-lg shadow-[var(--brand-primary)]/20 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center justify-center gap-3">
                {loading ? <LoadingSpinner size="sm" color="#fff" /> : <span>Sign Into Dashboard</span>}
              </div>
            </Button>
          </form>

          <footer className="mt-10 text-center">
             <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-base)] to-transparent w-full mb-6 opacity-30" />
             <p className="text-[11px] text-[var(--text-muted)] font-medium uppercase tracking-widest leading-loose">
               Secure Environment • vel-v-ac-01 <br/>
               <span className="opacity-60 italic">Managed by Antigravity Protocol</span>
             </p>
          </footer>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
