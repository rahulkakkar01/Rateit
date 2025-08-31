import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

interface UserRated {
  id: number;
  name: string;
  email: string;
  value: number;
  comment?: string;
}

interface Store {
  id: number;
  name: string;
  address: string;
  rating?: number;
  totalRatings?: number;
  usersRated?: UserRated[];
}

export default function AdminRatingsPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/admin/stores").then(res => {
      setStores(res.data);
      setLoading(false);
    }).catch(() => {
      setError("Failed to load stores");
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background effect */}
      <div className="absolute inset-0 -z-10">
        <div className="w-full h-full fixed">
          <div className="w-full h-full bg-gradient-to-br from-blue-300 via-cyan-200 to-purple-200 opacity-80 blur-xl animate-pulse"></div>
        </div>
      </div>
      <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-4xl flex flex-col items-center relative">
        <button className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 transition" onClick={() => navigate('/admin-dashboard')}>Back to Dashboard</button>
        <h1 className="text-3xl font-bold text-blue-600 mb-6">All Stores & Average Ratings</h1>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <table className="min-w-full border rounded-xl overflow-hidden">
            <thead>
              <tr>
                <th className="border px-4 py-2 bg-blue-50">Store Name</th>
                <th className="border px-4 py-2 bg-blue-50">Address</th>
                <th className="border px-4 py-2 bg-blue-50">Average Rating</th>
                <th className="border px-4 py-2 bg-blue-50">Total Ratings</th>
                <th className="border px-4 py-2 bg-blue-50">Users Who Rated</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store, index) => (
                <tr key={store.id ?? index} className="hover:bg-blue-50 transition">
                  <td className="border px-4 py-2">{store.name}</td>
                  <td className="border px-4 py-2">{store.address}</td>
                  <td className="border px-4 py-2">{store.rating ?? "N/A"}</td>
                  <td className="border px-4 py-2">{store.totalRatings ?? 0}</td>
                  <td className="border px-4 py-2">
                    {store.usersRated && store.usersRated.length > 0 ? (
                      <ul className="list-disc pl-4">
                        {store.usersRated.map((user, i) => (
                          <li key={user.id ?? i}>
                            <span className="font-semibold">{user.name}</span> ({user.email}) - Rating: {user.value}
                            {user.comment && <span className="text-gray-500">, "{user.comment}"</span>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-400">No ratings</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
