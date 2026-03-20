export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const getAuthHeaders = () => {
  const token = localStorage.getItem("edg_token");
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : "",
  };
};