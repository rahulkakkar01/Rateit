import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3600",
});


instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    if (config.headers) {
      delete config.headers["Authorization"];
    }
  }
  return config;
});

// Handle 401 Unauthorized globally
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default instance;
