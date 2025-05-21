import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { search } = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get("token");
    if (!token) {
      return navigate("/login", { replace: true });
    }

    localStorage.setItem("xeno_token", token);

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    navigate("/", { replace: true });
  }, [search, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg">Finishing login…</p>
    </div>
  );
}
