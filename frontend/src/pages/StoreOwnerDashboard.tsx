import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { ArrowRightOnRectangleIcon, BuildingStorefrontIcon, StarIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authcontext";

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
      <button 
        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition" 
        onClick={handleLogout}
      >
        <ArrowRightOnRectangleIcon className="w-5 h-5" /> Log Out
      </button>
    </header>
  ));

  const AnimatedBackground = React.memo(() => (
    <div className="absolute inset-0 -z-10">
      <div className="w-full h-full fixed">
        <div className="w-full h-full bg-gradient-to-br from-blue-300 via-cyan-200 to-purple-200 opacity-80 blur-xl animate-pulse"></div>
      </div>
    </div>
  ));

  const StoreInfo = React.memo(({ avgRating, loading }: { avgRating: number | null; loading: boolean }) => (
    <div className="bg-blue-50 rounded-xl p-6 shadow flex flex-col items-center">
      <span className="text-gray-500 text-sm">Overall Rating</span>
      <div className="flex items-center gap-2 mt-2">
        <StarIcon className="w-6 h-6 text-yellow-500" />
        <span className="text-2xl font-bold">{loading ? "..." : avgRating?.toFixed(1) || "No ratings yet"}</span>
      </div>
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
    if (loading) return <div>Loading reviews...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!reviews?.length) return <div className="text-gray-500">No reviews found.</div>;

    return (
      <div className="bg-white rounded-xl shadow border p-6">
        <h2 className="text-xl font-semibold mb-4">Order Reviews</h2>
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <div key={index} className="border-b pb-4">
              <div className="font-semibold">{review.name}</div>
              <div className="text-gray-500">{review.email}</div>
              <div className="flex items-center gap-2 mt-1">
                <StarIcon className="w-5 h-5 text-yellow-500" />
                <span className="text-yellow-600">{review.rating}</span>
              </div>
              <div className="text-gray-600 mt-2">{review.comment}</div>
            </div>
          ))}
        </div>
      </div>
    );
  });

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <AnimatedBackground />
      <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-4xl flex flex-col items-center relative">
        <StoreHeader />
        <section className="w-full mb-6">
          <StoreInfo avgRating={avgRating} loading={loading} />
        </section>
        <section className="w-full">
          <ReviewsList loading={loading} error={error} reviews={reviews} />
        </section>
      </div>
    </div>
  );
};
