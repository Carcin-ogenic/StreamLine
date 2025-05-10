import "./App.css";
import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [status, setStatus] = useState("loading…");
  useEffect(() => {
    axios
      .get(import.meta.env.VITE_API_URL + "/health")
      .then((res) => setStatus(res.data.status))
      .catch(() => setStatus("error"));
  }, []);
  return (
    <>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold text-center text-primary mb-4">Xeno CRM</h1>
          <p className="text-center text-gray-700">
            Backend status: <code className="bg-gray-200 p-1 rounded">{status}</code>
          </p>
        </div>
      </div>
    </>
  );
}

export default App;
