import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { ArrowRightOnRectangleIcon, BuildingStorefrontIcon, StarIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authcontext.tsx";

interface DashboardUser {
  id: number;
  name: string;
  email: string;
  rating: number;
  comment: string;
}

interface DashboardData {
  users: DashboardUser[];
  avgRating: number;
  status?: string;
  message?: string;
}

export default function StoreOwnerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [reviews, setReviews] = useState<DashboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "shopowner") {
      navigate("/login");
      return;
    }
    axios.get<DashboardData>(`/shopowner/dashboard`)
      .then(res => {
        if (res.data.status === 'fail') {
          setError(res.data.message || "Failed to load store data");
          return;
        }
        setAvgRating(res.data.avgRating);
        setReviews(res.data.users);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load store data.");
        setLoading(false);
      });
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const StoreHeader = React.memo(() => (
    <header className="w-full flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-blue-600">Store Owner Dashboard</h1>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsPasswordModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Change Password
        </button>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition" 
          onClick={handleLogout}
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" /> Log Out
        </button>
      </div>
    </header>
  ));

  const AnimatedBackground = React.memo(() => (
    <div className="absolute inset-0 -z-10">
      <div className="w-full h-full fixed">
        <div className="w-full h-full bg-gradient-to-br from-blue-300 via-cyan-200 to-purple-200 opacity-80 blur-xl animate-pulse"></div>
      </div>
    </div>
  ));

  const ChangePasswordModal = React.memo(({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Change Password</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ChangePasswordForm onSuccess={() => {
            onClose();
          }} />
        </div>
      </div>
    );
  });

  const ChangePasswordForm = React.memo(({ onSuccess }: { onSuccess: () => void }) => {
    const [passwords, setPasswords] = useState({
      oldPassword: "",
      newPassword: ""
    });
    const [changeError, setChangeError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const handlePasswordChange = async (e: React.FormEvent) => {
      e.preventDefault();
      setChangeError("");
      setSuccessMsg("");

      // Validate new password
      if (!/^.*[A-Z].*$/.test(passwords.newPassword) || 
          !/^.*[^A-Za-z0-9].*$/.test(passwords.newPassword) || 
          passwords.newPassword.length < 8 || 
          passwords.newPassword.length > 16) {
        setChangeError("New password must be 8-16 chars, include uppercase & special char.");
        return;
      }

      try {
        const response = await axios.patch('/shopowner/update-password', {
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword
        });

        if (response.data.status === 'success') {
          setSuccessMsg("Password changed successfully!");
          setPasswords({ oldPassword: "", newPassword: "" });
          onSuccess();
        } else {
          setChangeError(response.data.message || "Failed to change password");
        }
      } catch (error: any) {
        setChangeError(error.response?.data?.message || "Failed to change password");
      }
    };

    return (
      <div className="bg-white rounded-xl shadow border p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <input
              type="password"
              value={passwords.oldPassword}
              onChange={(e) => setPasswords(prev => ({ ...prev, oldPassword: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          {changeError && <p className="text-red-500 text-sm">{changeError}</p>}
          {successMsg && <p className="text-green-500 text-sm">{successMsg}</p>}
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Change Password
          </button>
        </form>
      </div>
    );
  });

  const StoreOwnerProfile = React.memo(() => {
    const { user } = useAuth();
    
    return (
      <div className="bg-white rounded-xl shadow p-8">
        <h2 className="text-xl font-semibold mb-6 text-blue-900 flex items-center gap-2">
          <BuildingStorefrontIcon className="w-6 h-6 text-blue-600" />
          Store Owner Profile
        </h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 rounded-full p-4">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{user?.name || 'Store Owner'}</h3>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Store ID</p>
              <p className="font-medium text-gray-900">#{user?.id}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium text-gray-900 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    );
  });

  const StoreInfo = React.memo(({ avgRating, loading }: { avgRating: number | null; loading: boolean }) => (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 shadow-lg flex flex-col items-center">
      <h2 className="text-xl font-semibold text-blue-900 mb-2">Store Rating</h2>
      <div className="bg-white rounded-full p-6 shadow-inner mb-4">
        <div className="flex items-center gap-3">
          <StarIcon className="w-8 h-8 text-yellow-500" />
          <span className="text-4xl font-bold text-blue-900">
            {loading ? "..." : avgRating?.toFixed(1) || "0.0"}
          </span>
        </div>
      </div>
      <span className="text-blue-600 text-sm">
        {loading ? "Loading ratings..." : avgRating ? "Average Store Rating" : "No ratings yet"}
      </span>
    </div>
  ));

  const ReviewsList = React.memo(({ 
    loading, 
    error, 
    reviews 
  }: { 
    loading: boolean; 
    error: string; 
    reviews: DashboardUser[] 
  }) => {
    if (loading) return (
      <div className="bg-white rounded-xl shadow p-8 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-6 w-32 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-6 w-full">
            {[1,2,3].map(i => (
              <div key={i} className="flex flex-col space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    if (error) return (
      <div className="bg-white rounded-xl shadow p-8">
        <div className="text-red-500 text-center">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-semibold">{error}</p>
        </div>
      </div>
    );

    return (
      <div className="bg-white rounded-xl shadow p-8">
        <h2 className="text-xl font-semibold mb-6 text-blue-900 flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
          Customer Reviews
        </h2>
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-lg">No reviews yet</p>
              <p className="text-sm mt-2">Reviews will appear here when customers rate your store</p>
            </div>
          ) : (
            reviews.map((review, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 transition-transform hover:scale-[1.02] duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900">{review.name}</div>
                    <div className="text-sm text-gray-500">{review.email}</div>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                    <StarIcon className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold text-yellow-700">{review.rating}</span>
                  </div>
                </div>
                <div className="text-gray-700 bg-white rounded-lg p-4 shadow-sm">
                  {review.comment || "No comment provided"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  });

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <AnimatedBackground />
      <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-5xl relative">
        <StoreHeader />
        <div className="space-y-8 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <StoreOwnerProfile />
            <StoreInfo avgRating={avgRating} loading={loading} />
          </div>
          <ReviewsList loading={loading} error={error} reviews={reviews} />
        </div>
        <ChangePasswordModal 
          isOpen={isPasswordModalOpen} 
          onClose={() => setIsPasswordModalOpen(false)} 
        />
      </div>
    </div>
  );
  
};
