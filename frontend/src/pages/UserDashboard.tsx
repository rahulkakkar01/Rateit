import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

interface Store {
  id: number;
  name: string;
  address: string;
  rating: number;
  totalRatings: number;
  userRating?: number;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [submittingRating, setSubmittingRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<{ storeId: number; rating: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Decode JWT token to check role
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'user') {
        setError("Access denied. This dashboard is only for regular users.");
        navigate("/login");
        return;
      }
    } catch (e) {
      navigate("/login");
      return;
    }

    fetchStores();
  }, [navigate]);

  const fetchStores = async () => {
    try {
      setError(null);
      
      // First, get all stores - using /user/stores endpoint
      const storesRes = await api.get("/user/stores");
      
      // Process and deduplicate stores
      const uniqueStores = new Map();
      storesRes.data.forEach((store: Store) => {
        if (!uniqueStores.has(store.id) && store.id !== undefined) {
          uniqueStores.set(store.id, {
            ...store,
            id: store.id,
            rating: parseFloat(store.rating?.toString() || '0'),
            totalRatings: parseInt(store.totalRatings?.toString() || '0'),
            userRating: undefined
          });
        }
      });

      try {
  // Get user's ratings using /user/ratings endpoint
  const ratingsRes = await api.get("/user/ratings");
        const userRatings = ratingsRes.data || [];
        
        // Update stores with user ratings if available
        userRatings.forEach((rating: any) => {
          if (uniqueStores.has(rating.storeId)) {
            const store = uniqueStores.get(rating.storeId);
            uniqueStores.set(rating.storeId, {
              ...store,
              userRating: parseInt(rating.rating.toString())
            });
          }
        });
      } catch (ratingError) {
        // Continue without user ratings
      }

      setStores(Array.from(uniqueStores.values()));
    } catch (error) {
      setError("Failed to load stores. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async (storeId: number, rating: number) => {
    try {
      setSubmittingRating(storeId);
      setError(null);
      
      // Submit rating using the correct backend endpoint
      await api.post(`/user/stores/${storeId}/rate`, { 
        rating: parseInt(rating.toString())
      });
      
      // Optimistically update the local state
      setStores(prev => prev.map(store => 
        store.id === storeId 
          ? { ...store, userRating: rating }
          : store
      ));
      
      // Then refresh all data
      await fetchStores();
      
    } catch (error) {
      setError("Failed to submit rating. Please try again.");
      // Refresh data to ensure consistent state
      await fetchStores();
    } finally {
      setSubmittingRating(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-100 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Store Ratings</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Log Out
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search stores by name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {store.name}
                </h3>
                <p className="text-gray-600 mb-4">{store.address}</p>
                
                <div className="space-y-4">
                  {/* Overall Rating */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Overall Rating:</span>
                    <div className="flex items-center">
                      <StarIconSolid className="w-5 h-5 text-yellow-400" />
                      <span className="ml-1 text-gray-900">
                        {store.rating.toFixed(1)} ({store.totalRatings} {store.totalRatings === 1 ? 'rating' : 'ratings'})
                      </span>
                    </div>
                  </div>

                  {/* User Rating */}
                  <div>
                    <span className="text-sm text-gray-500 block mb-1">Your Rating:</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={`${store.id}-${rating}`}
                          disabled={submittingRating === store.id}
                          onClick={() => handleRatingSubmit(store.id, rating)}
                          onMouseEnter={() => setHoveredRating({ storeId: store.id, rating })}
                          onMouseLeave={() => setHoveredRating(null)}
                          className="focus:outline-none transition-colors disabled:opacity-50"
                        >
                          {rating <= (hoveredRating?.storeId === store.id ? hoveredRating.rating : (store.userRating || 0)) ? (
                            <StarIconSolid className="w-8 h-8 text-yellow-400" />
                          ) : (
                            <StarIcon className="w-8 h-8 text-gray-300 hover:text-yellow-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredStores.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            {searchTerm ? "No stores match your search." : "No stores available."}
          </div>
        )}
      </div>
    </div>
  );
}
