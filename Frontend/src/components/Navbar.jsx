import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Navbar({ userName }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("xeno_token");
    delete axios.defaults.headers.common["Authorization"];
    navigate("/login");
  };

  return (
    <header className="bg-white shadow !p-6 flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <h1 className="text-xl font-bold !mb-0">Welcome, {userName}</h1>
        <nav className="space-x-4">
          <Link to="/" className="text-gray-700 hover:text-blue-600 ">
            Dashboard
          </Link>
          <Link to="/segments/new" className="text-gray-700 hover:text-blue-600">
            New Segment
          </Link>
          <Link to="/campaigns" className="text-gray-700 hover:text-blue-600">
            Campaigns
          </Link>
        </nav>
      </div>
      <button onClick={handleLogout} className="text-sm underline !mr-3 !text-red-500 !hover:cursor-pointer">
        Logout
      </button>
    </header>
  );
}
