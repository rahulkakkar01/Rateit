import React, { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/authcontext";
import { useNavigate } from "react-router-dom";

interface RoleButtonProps {
  isSelected: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

const RoleButton: React.FC<RoleButtonProps> = ({ isSelected, onClick, icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      flex flex-col items-center
      rounded-xl p-4
      transition-all duration-200
      ${isSelected ? 'bg-blue-50 border-2 border-blue-500' : 'bg-white border-2 border-gray-200'}
      hover:border-blue-300
      shadow-sm
    `}
  >
    <span className="text-2xl mb-1">{icon}</span>
    <span className="text-sm font-medium">{isSelected ? 'Selected' : label}</span>
  </button>
);

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [role, setRole] = useState("user"); // Initial role
  const { login } = useAuth();
  const navigate = useNavigate();

  // No need for role conversion anymore
  const getBackendRole = (frontendRole: string) => frontendRole;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    // Email validation
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Invalid email address.";
    }
    // Password: 8-16, 1 uppercase, 1 special
    if (!/^.*[A-Z].*$/.test(password) || !/^.*[^A-Za-z0-9].*$/.test(password) || password.length < 8 || password.length > 16) {
      newErrors.password = "Password must be 8-16 chars, include uppercase & special char.";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    try {
      // Convert role before sending to backend
      const loginRole = getBackendRole(role);
      const res = await api.post("/auth/login", { email, password, role: loginRole });
      
      if (!res.data || !res.data.accessToken) {
        throw new Error("Invalid response format: missing access token");
      }
      
      if (res.data.status === 'fail') {
        setErrors({
          auth: res.data.message
        });
        return;
      }

      const token = res.data.accessToken;
      const serverRole = res.data.role;

      // Compare server role with expected role
      if (serverRole !== loginRole) {
        setErrors({
          auth: `You don't have permission to access the ${role} panel. Your account is registered as ${serverRole}.`
        });
        return;
      }

      // Store both token and user data
      localStorage.setItem("token", token);
      const userData = {
        ...res.data.user,
        token,
        role: serverRole
      };
      localStorage.setItem("user", JSON.stringify(userData));
      login(userData);

      // Redirect based on validated role
      switch (serverRole) {
        case "admin":
          navigate("/admin-dashboard");
          break;
        case "shopowner":
          navigate("/shopowner-dashboard");
          break;
        case "user":
          navigate("/dashboard");
          break;
        default:
          setErrors({
            auth: "Invalid role received from server"
          });
          localStorage.removeItem("token");
          return;
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background effect */}
      <div className="absolute inset-0 -z-10">
        <div className="w-full h-full fixed">
          <div className="w-full h-full bg-gradient-to-br from-blue-300 via-cyan-200 to-purple-200 opacity-80 blur-xl animate-pulse"></div>
        </div>
      </div>
      <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-md flex flex-col items-center relative">
        <h2 className="text-3xl font-bold text-blue-600 mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`input w-full p-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg${errors.email ? ' input:invalid' : ''}`}
            required
            style={errors.email ? { color: 'red', animation: 'justshake 0.3s forwards' } : {}}
          />
          {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`input w-full p-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg${errors.password ? ' input:invalid' : ''}`}
            minLength={8}
            maxLength={16}
            required
            style={errors.password ? { color: 'red', animation: 'justshake 0.3s forwards' } : {}}
          />
          {errors.password && <span className="text-red-500 text-xs">{errors.password}</span>}
          {errors.auth && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">
              {errors.auth}
            </div>
          )}
          <div className="flex justify-between items-center mb-4">
            <button type="button" className="text-blue-500 hover:underline text-sm">Forgot Password?</button>
          </div>
          
          <div className="flex justify-center gap-4 my-4">
            <RoleButton
              isSelected={role === 'user'}
              onClick={() => setRole('user')}
              icon="🧑"
              label="User"
            />
            <RoleButton
              isSelected={role === 'shopowner'}
              onClick={() => setRole('shopowner')}
              icon="🏪"
              label="Shop Owner"
            />
            <RoleButton
              isSelected={role === 'admin'}
              onClick={() => setRole('admin')}
              icon="🛡️"
              label="Admin"
            />
          </div>
          
          <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold py-3 rounded-full text-lg shadow hover:from-blue-600 hover:to-cyan-500 transition">Login</button>
        
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="text-sm text-gray-600">
              Don't have an account?
            </div>
            <button
              onClick={() => navigate('/signup')}
              className="text-blue-500 hover:text-blue-600 font-medium text-sm transition"
            >
              Sign up here
            </button>
          </div>
        </form>
        <div className="mt-6 text-center text-xs text-blue-500">
          By logging in, you agree to our user licence agreement
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
