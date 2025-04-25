import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://34.44.189.201/token", {
        grant_type: "password",
        username: username,
        password: password,
        client_id: "string", 
        client_secret: "string", 
      });

      // Handle successful login, e.g., save token, navigate to index
      const { access_token } = response.data;
      console.log("Access Token:", access_token);

      // Navigate to the index page
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      // Handle error (e.g., show error message)
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border p-2 mb-2 rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 mb-4 rounded"
      />
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Login
      </button>
    </div>
  );
};

export default Login;
