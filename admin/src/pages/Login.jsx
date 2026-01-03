import React, { useContext, useState } from "react";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
import axios from "axios";
import { authDataContext } from "../context/AuthContext";
import { adminDataContext } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { serverUrl } = useContext(authDataContext);
  const { getAdmin } = useContext(adminDataContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
        toast.success("Admin access granted");
        getAdmin();
        navigate("/");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background-subtle)] px-4">
      <Card className="w-full max-w-md p-8 md:p-12">
        <div className="text-center mb-10">
          <div className="inline-block px-3 py-1 mb-4 text-[10px] font-bold uppercase tracking-widest text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 rounded-full border border-[var(--brand-primary)]/20">
            Admin Portal
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Velviera Control</h1>
          <p className="text-sm text-[var(--text-muted)]">Please sign in to manage your store.</p>
        </div>

        <form onSubmit={handleAdminLogin} className="flex flex-col gap-6">
          <Input 
            label="Admin Email" 
            type="email" 
            placeholder="admin@velviera.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          
          <div className="relative">
            <Input 
              label="Password" 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-[var(--text-muted)] hover:text-[var(--text-base)]"
            >
              {showPassword ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
            </button>
          </div>

          <Button type="submit" size="lg" disabled={loading} className="w-full h-12">
            {loading ? "Authenticating..." : "Sign In to Admin"}
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-[var(--text-muted)]">
          Authorized personnel only. All access is logged and monitored.
        </p>
      </Card>
    </div>
  );
};

export default Login;
