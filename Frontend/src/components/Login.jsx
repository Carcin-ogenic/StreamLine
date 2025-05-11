export default function Login() {
  const handleLogin = () => {
    window.location.href = import.meta.env.VITE_API_URL + "/auth/google";
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <button onClick={handleLogin} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Log in with Google
      </button>
    </div>
  );
}
