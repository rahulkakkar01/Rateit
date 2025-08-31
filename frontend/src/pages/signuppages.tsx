import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    address: "",
    storeName: "",
    storeAddress: ""
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [role, setRole] = useState("user");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    // Name: Min 20, Max 60
    if (form.name.length < 20 || form.name.length > 60) {
      newErrors.name = "Name must be 20-60 characters.";
    }
    // Address: Max 400
    if (form.address.length > 400) {
      newErrors.address = "Address must be less than 400 characters.";
    }
    // Password: 8-16, 1 uppercase, 1 special
    if (!/^.*[A-Z].*$/.test(form.password) || !/^.*[^A-Za-z0-9].*$/.test(form.password) || form.password.length < 8 || form.password.length > 16) {
      newErrors.password = "Password must be 8-16 chars, include uppercase & special char.";
    }
    // Email: basic regex
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Invalid email address.";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    try {
      if (role === 'shopowner') {
        await api.post("/auth/register-shopowner", {
          ownerName: form.name,
          ownerEmail: form.email,
          ownerPassword: form.password,
          ownerAddress: form.address,
          storeName: form.storeName,
          storeAddress: form.storeAddress
        });
      } else {
        await api.post("/auth/register", { ...form, role });
      }
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (err: any) {
      if (err.response?.data === "User already exists") {
        alert("A user with this email already exists. Please login instead.");
      } else {
        alert(err.response?.data?.message || "Signup failed");
      }
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
        <h2 className="text-3xl font-bold text-blue-600 mb-6">Sign Up</h2>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={`input w-full p-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg${errors.name ? ' input:invalid' : ''}`}
            minLength={20}
            maxLength={60}
            required
            style={errors.name ? { color: 'red', animation: 'justshake 0.3s forwards' } : {}}
          />
          {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
          <input
            type="email"
            placeholder="E-mail"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={`input w-full p-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg${errors.email ? ' input:invalid' : ''}`}
            required
            style={errors.email ? { color: 'red', animation: 'justshake 0.3s forwards' } : {}}
          />
          {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={`input w-full p-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg${errors.password ? ' input:invalid' : ''}`}
            minLength={8}
            maxLength={16}
            required
            style={errors.password ? { color: 'red', animation: 'justshake 0.3s forwards' } : {}}
          />
          {errors.password && <span className="text-red-500 text-xs">{errors.password}</span>}
          <input
            type="text"
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className={`input w-full p-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg${errors.address ? ' input:invalid' : ''}`}
            maxLength={400}
            required
            style={errors.address ? { color: 'red', animation: 'justshake 0.3s forwards' } : {}}
          />
          {errors.address && <span className="text-red-500 text-xs">{errors.address}</span>}

          <div className="flex justify-center gap-4 my-4">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`px-6 py-2 rounded-full ${
                role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Register as User
            </button>
            <button
              type="button"
              onClick={() => setRole('shopowner')}
              className={`px-6 py-2 rounded-full ${
                role === 'shopowner' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Register as Shop Owner
            </button>
          </div>

          {role === 'shopowner' && (
            <>
              <input
                type="text"
                placeholder="Store Name"
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="input w-full p-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg"
                required={role === 'shopowner'}
              />
              <input
                type="text"
                placeholder="Store Address"
                value={form.storeAddress}
                onChange={(e) => setForm({ ...form, storeAddress: e.target.value })}
                className="input w-full p-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg"
                required={role === 'shopowner'}
              />
            </>
          )}
          <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold py-3 rounded-full text-lg shadow hover:from-blue-600 hover:to-cyan-500 transition">Sign Up</button>
        </form>
        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="text-sm text-gray-600">
            Already have an account?
          </div>
          <button
            onClick={() => navigate('/login')}
            className="text-blue-500 hover:text-blue-600 font-medium text-sm transition"
          >
            Login here
          </button>
          <div className="mt-4 text-xs text-blue-500">
            By signing up, you agree to our user licence agreement
          </div>
        </div>
      </div>
    </div>
  );
}
