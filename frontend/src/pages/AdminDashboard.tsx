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
  
  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [minRating, setMinRating] = useState("");
  const [maxRating, setMaxRating] = useState("");
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'users' | 'stores' | 'ratings'>('dashboard');
  // User-specific filters
  const [userRoleFilter, setUserRoleFilter] = useState("all");

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

  const fetchUsers = async (params = {}) => {
    setLoadingUsers(true);
    try {
      const queryParams = new URLSearchParams(params);
      const response = await axios.get(`/admin/users?${queryParams.toString()}`);
      setUsers(response.data.users || response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchStores = async (params = {}) => {
    setLoadingStores(true);
    try {
      const queryParams = new URLSearchParams(params);
      const response = await axios.get(`/admin/stores?${queryParams.toString()}`);
      setStores(response.data.stores || response.data);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoadingStores(false);
    }
  };

  React.useEffect(() => {
    // Fetch stats
    axios.get("/admin/dashboard").then(res => {
      setStats(res.data);
      setLoadingStats(false);
    }).catch(() => setLoadingStats(false));

  // Initial fetch of users and stores
  fetchUsers();
  fetchStores();
  }, []);

  // Handle search
  const handleSearch = () => {
    const userParams = {
      search: searchQuery,
      sortBy,
      order: sortOrder
  ,
  ...(userRoleFilter && userRoleFilter !== 'all' ? { role: userRoleFilter } : {})
    };

    const storeParams = {
      search: searchQuery,
      sortBy,
      order: sortOrder,
      ...(minRating && { minRating }),
      ...(maxRating && { maxRating })
    };

    fetchUsers(userParams);
    fetchStores(storeParams);
  };

  // Call when switching tabs so the selected list is populated with current filters
  const handleSelectTab = (tab: 'dashboard' | 'users' | 'stores' | 'ratings') => {
    setSelectedTab(tab);
    const userParams = {
      search: searchQuery,
      sortBy,
      order: sortOrder,
      ...(userRoleFilter && userRoleFilter !== 'all' ? { role: userRoleFilter } : {})
    };

    const storeParams = {
      search: searchQuery,
      sortBy,
      order: sortOrder,
      ...(minRating && { minRating }),
      ...(maxRating && { maxRating })
    };

    if (tab === 'users') fetchUsers(userParams);
    if (tab === 'stores') fetchStores(storeParams);
  };

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
          <div key="nav-users" onClick={() => handleSelectTab('users')} className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer" role="button">
            <UserIcon className="w-5 h-5" /> Users
          </div>
          <div key="nav-stores" onClick={() => handleSelectTab('stores')} className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer" role="button">
            <BuildingStorefrontIcon className="w-5 h-5" /> Stores
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
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-gray-600" />
              </div>
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

        {/* Search and Filter Section */}
        <section className="p-6">
          <div className="bg-white rounded-xl shadow border p-6">
            <h2 className="text-xl font-semibold mb-4">Search and Filters</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <input
                className="p-3 border rounded-lg"
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="p-3 border rounded-lg"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="createdAt">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="rating">Sort by Rating</option>
              </select>
              <select
                className="p-3 border rounded-lg"
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
              >
                <option value="all">All roles</option>
                <option value="user">User</option>
                <option value="shopowner">Store Owner</option>
                <option value="admin">Admin</option>
              </select>
              <select
                className="p-3 border rounded-lg"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="DESC">Descending</option>
                <option value="ASC">Ascending</option>
              </select>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
            
            {/* Store List */}
            {selectedTab === 'dashboard' || selectedTab === 'stores' ? (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Stores</h2>
                <div className="grid gap-4 md:grid-cols-2 mb-4">
                  <input
                    className="p-3 border rounded-lg"
                    type="number"
                    placeholder="Minimum Rating"
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                  />
                  <input
                    className="p-3 border rounded-lg"
                    type="number"
                    placeholder="Maximum Rating"
                    value={maxRating}
                    onChange={(e) => setMaxRating(e.target.value)}
                  />
                </div>
                <div className="space-y-4">
                  {loadingStores ? (
                    <div className="text-center py-4">Loading stores...</div>
                  ) : stores.length === 0 ? (
                    <div className="text-gray-500 text-center py-4">No stores found.</div>
                  ) : (
                    stores.map((store) => (
                      <div key={store.id} className="flex items-start gap-4 border-b pb-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <BuildingStorefrontIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{store.name}</h3>
                          <p className="text-gray-500 text-sm">{store.owner?.email}</p>
                          <p className="text-gray-600 text-sm mt-1">📍 {store.address}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <StarIcon className="w-5 h-5 text-yellow-500" />
                            <span className="font-medium">{store.rating?.toFixed(1) || 'No ratings'}</span>
                            <span className="text-gray-500 text-sm">({store.totalRatings} reviews)</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* User List */}
        {selectedTab === 'dashboard' || selectedTab === 'users' ? (
          <section className="p-6">
            <div className="bg-white rounded-xl shadow border p-6">
              <h2 className="text-xl font-semibold mb-4">Users</h2>
              <div className="space-y-4">
                {loadingUsers ? (
                  <div className="text-center py-4">Loading users...</div>
                ) : users.length === 0 ? (
                  <div className="text-gray-500 text-center py-4">No users found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="px-6 py-4 flex items-center gap-3">
                              <div className="bg-blue-100 p-2 rounded-full">
                                <UserIcon className="w-4 h-4 text-blue-600" />
                              </div>
                              <span>{user.name}</span>
                            </td>
                            <td className="px-6 py-4">{user.email}</td>
                            <td className="px-6 py-4 capitalize">{user.role}</td>
                            <td className="px-6 py-4">{user.address}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
