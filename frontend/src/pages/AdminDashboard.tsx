import React, { useState } from "react";
import axios from "../api/axios";
import { UserIcon, StarIcon, PlusIcon, ArrowRightOnRectangleIcon, BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  // Fetch actual stats, users, and stores from backend
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingStores, setLoadingStores] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "user",
    // Additional fields for store owner
    storeName: "",
    storeAddress: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  React.useEffect(() => {
    // Fetch stats
    axios.get("/admin/dashboard").then(res => {
      setStats(res.data);
      setLoadingStats(false);
    }).catch(() => setLoadingStats(false));
    // Fetch users
    axios.get("/admin/users").then(res => {
      setUsers(res.data);
      setLoadingUsers(false);
    }).catch(() => setLoadingUsers(false));
    // Fetch stores
    axios.get("/admin/stores").then(res => {
      setStores(res.data);
      setLoadingStores(false);
    }).catch(() => setLoadingStores(false));
  }, []);

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (form.role === "shopowner") {
        await axios.post("/admin/add-shop", {
          ownerName: form.name,
          ownerEmail: form.email,
          ownerPassword: form.password,
          ownerAddress: form.address,
          storeName: form.storeName,
          storeAddress: form.storeAddress
        });
        setSuccess("Store Owner and Store added successfully!");
      } else {
        await axios.post("/user/signup", form);
        setSuccess("User added successfully!");
      }
      setForm({
        name: "",
        email: "",
        password: "",
        address: "",
        role: "user",
        storeName: "",
        storeAddress: ""
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to add user/store owner.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 text-2xl font-bold">🚀 Admin Panel</div>
        <nav className="flex-1 px-4 space-y-2">
          <div key="nav-users" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer" role="button">
            <UserIcon className="w-5 h-5" /> Users
          </div>
          <div key="nav-stores" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer" role="button">
            <BuildingStorefrontIcon className="w-5 h-5" /> Stores
          </div>
          <div 
            key="nav-ratings" 
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer" 
            role="button"
            onClick={() => navigate('/admin-ratings')}
          >
            <StarIcon className="w-5 h-5" /> Ratings
          </div>
        </nav>
        <button className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg m-4 hover:bg-red-600" onClick={handleLogout}>
          <ArrowRightOnRectangleIcon className="w-5 h-5" /> Log Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Header */}
        <header className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 bg-gray-100 rounded-full">🔔</button>
            <div className="flex items-center gap-2">
              <img
                src="https://i.pravatar.cc/40"
                alt="Admin"
                className="w-8 h-8 rounded-full"
              />
              <span className="text-gray-700 font-medium">Admin</span>
            </div>
          </div>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div key="stats-users" className="bg-white p-6 rounded-xl shadow border flex flex-col">
            <span className="text-gray-500 text-sm">Total Users</span>
            <span className="text-3xl font-bold mt-2">{loadingStats ? "..." : stats.totalUsers}</span>
          </div>
          <div key="stats-stores" className="bg-white p-6 rounded-xl shadow border flex flex-col">
            <span className="text-gray-500 text-sm">Total Stores</span>
            <span className="text-3xl font-bold mt-2">{loadingStats ? "..." : stats.totalStores}</span>
          </div>
        </section>

        {/* Add User */}
        <section className="p-6">
          <div className="bg-white rounded-xl shadow border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <PlusIcon className="w-5 h-5" /> Add New User / Store Owner
            </h2>

            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={handleSubmit}
            >
              <input
                className="p-3 border rounded-lg"
                type="text"
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <input
                className="p-3 border rounded-lg"
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <input
                className="p-3 border rounded-lg"
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <input
                className="p-3 border rounded-lg"
                type="text"
                name="address"
                placeholder="Address"
                value={form.address}
                onChange={handleChange}
                required
              />
              <select
                className="p-3 border rounded-lg"
                name="role"
                value={form.role}
                onChange={handleChange}
                required
              >
                <option value="user">User</option>
                <option value="shopowner">Store Owner</option>
              </select>
              
              {form.role === "shopowner" && (
                <>
                  <input
                    className="p-3 border rounded-lg"
                    type="text"
                    name="storeName"
                    placeholder="Store Name"
                    value={form.storeName}
                    onChange={handleChange}
                    required={form.role === "shopowner"}
                  />
                  <input
                    className="p-3 border rounded-lg"
                    type="text"
                    name="storeAddress"
                    placeholder="Store Address"
                    value={form.storeAddress}
                    onChange={handleChange}
                    required={form.role === "shopowner"}
                  />
                </>
              )}
              
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold shadow-md col-span-full"
                disabled={loading}
              >
                {loading ? "Adding..." : form.role === "shopowner" ? "Add Store Owner" : "Add User"}
              </button>
            </form>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            {success && (
              <div className="text-green-600 text-sm mt-2">{success}</div>
            )}
          </div>
        </section>

        {/* Store List */}
        <section className="p-6">
          <div className="bg-white rounded-xl shadow border p-6">
            <h2 className="text-xl font-semibold mb-4">Stores</h2>
            <input className="w-full mb-4 p-3 border rounded-lg" type="text" placeholder="Search stores..." />
            <div className="space-y-4">
              {loadingStores ? (
                <div>Loading stores...</div>
              ) : stores.length === 0 ? (
                <div className="text-gray-500">No stores found.</div>
              ) : (
                stores.map((store) => (
                  <div key={store.id} className="flex items-start gap-4 border-b pb-4">
                    <img src={store.avatarUrl || "https://i.pravatar.cc/50"} alt="Store Owner" className="w-12 h-12 rounded-full" />
                    <div>
                      <h3 className="font-semibold">{store.name}</h3>
                      <p className="text-gray-500 text-sm">{store.owner?.email}</p>
                      <p className="text-gray-600 text-sm mt-1">📍 {store.address}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center text-yellow-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={star <= store.rating ? "text-yellow-500" : "text-gray-300"}>
                              ★
                            </span>
                          ))}
                        </div>
                        <p className="text-yellow-600 text-sm">
                          {store.rating ? `${store.rating.toFixed(1)} (${store.totalRatings} ratings)` : 'No ratings yet'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* User List */}
        <section className="p-6">
          <div className="bg-white rounded-xl shadow border p-6">
            <h2 className="text-xl font-semibold mb-4">Users</h2>
            <input className="w-full mb-4 p-3 border rounded-lg" type="text" placeholder="Search users..." />
            <div className="space-y-4">
              {loadingUsers ? (
                <div>Loading users...</div>
              ) : users.length === 0 ? (
                <div className="text-gray-500">No users found.</div>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="flex items-start gap-4 border-b pb-4">
                    <img src={user.avatarUrl || "https://i.pravatar.cc/50"} alt="User" className="w-12 h-12 rounded-full" />
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-gray-500 text-sm">{user.email}</p>
                      <p className="text-gray-600 text-sm mt-1">Address: {user.address}</p>
                      <p className="text-blue-600 text-sm mt-1">Role: {user.role}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
