import { useState, useContext } from "react";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/auth/login", {
        email,
        password
      });

      const data = res.data;

      // Save token
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      // Save to context
      login(data);

      // Redirect based on role
      if (data.role === "teacher") {
        navigate("/teacher");
      } else {
        navigate("/student");
      }

    } catch (err) {

      console.error("Login Error:", err);

      if (err.response) {
        setError(err.response.data.message || "Login failed");
      } else {
        setError("Server not responding");
      }

    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="flex items-center justify-center min-h-screen bg-gray-100">

      <div className="bg-white p-6 rounded shadow w-full max-w-md">

        <h2 className="text-2xl font-bold mb-4">
          Login
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 mb-3 rounded text-sm">
            {error}
          </div>
        )}

        <input
          className="border p-2 w-full mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border p-2 w-full mb-3"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-blue-600 text-white w-full p-2 rounded"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Register Section */}

        <div className="text-center mt-4">

          <p className="text-sm text-gray-600">
            Don't have an account?
          </p>

          <button
            onClick={() => navigate("/register")}
            className="text-blue-600 font-semibold mt-1"
          >
            Register
          </button>

        </div>

      </div>

    </div>

  );

}