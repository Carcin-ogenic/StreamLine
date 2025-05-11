// src/components/AuthCallback.jsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { search } = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get("token"); // ← get the JWT we embedded in the URL
    if (!token) {
      // No token? Something went wrong, go back to login
      return navigate("/login", { replace: true });
    }

    // 1) Persist it
    localStorage.setItem("xeno_token", token);

    // 2) Configure Axios for future API calls
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // 3) Move into the protected area of your app
    navigate("/", { replace: true });
  }, [search, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg">Finishing login…</p>
    </div>
  );
}
