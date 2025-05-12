import "./App.css";
import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./components/Navbar.jsx";

export default function App() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("xeno_token");
    if (!token) {
      setChecking(false);
      return;
    }

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    axios
      .get(import.meta.env.VITE_API_URL + "/api/profile")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return <p className="text-center mt-10">Checking authentication…</p>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={user.name} />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
