import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LuEye, LuEyeClosed } from "react-icons/lu";
import Cookies from "js-cookie";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const navigate = useNavigate();

  const handleLogin = async () => {
    setErrorMessage(""); // Reset error message on new login attempt

    // Validate input fields
    if (!username || !password) {
      setErrorMessage("請同時輸入用戶名同密碼");
      return; // Stop execution if validation fails
    }

    try {
      const response = await axios.post(
        "http://34.44.189.201/token",
        new URLSearchParams({
          grant_type: "password",
          username: username,
          password: password,
          client_id: "string",
          client_secret: "string",
        }),
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const { access_token } = response.data;
      Cookies.set("access_token", access_token, { expires: 7 });

      try {
        const response = await axios.get("http://34.44.189.201/users/me", {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        });
        localStorage.setItem("username", response.data.username);
        navigate("/");
      } catch (error) {
        console.error("Error fetching user data:", error);
        setErrorMessage(error);
      }
    } catch (error) {
      console.error("Login failed:", error);
      if (error.response && error.response.data) {
        setErrorMessage(
          error.response.data.message || "登入失敗咗, 請試多一次"
        );
      } else {
        setErrorMessage("登入失敗, 請檢查你嘅憑證，然後再試一次");
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white rounded-[10px] shadow-lg p-8 w-96">
        <div className="flex justify-center my-8">
          <h1 className="text-[25px] font-bold text-center mb-6">
            Best Chance
          </h1>
        </div>
        <input
          type="text"
          placeholder="輸入用戶名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 mb-4 w-full rounded"
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="輸入密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded"
          >
            {showPassword ? <LuEyeClosed /> : <LuEye />}
          </button>
        </div>
        <div className="text-right mb-10 mt-2 text-[12px]">
          <button
            onClick={() =>
              alert("Forgot Password functionality not implemented")
            }
            className="text-gray-400 underline"
          >
            唔記得密碼?
          </button>
          {errorMessage && (
            <div className="mb-4 text-red-500 text-center">{errorMessage}</div>
          )}
        </div>
        <div className="flex justify-center">
          <button
            onClick={handleLogin}
            className="bg-orange-500 text-white p-2 rounded-[30px] w-[50%]"
          >
            登入
          </button>
        </div>

        <div className="mt-6 text-center">
          <span className="text-sm text-gray-600">還沒有帳戶?</span>
          <button
            onClick={() => alert("請聯絡 Virpluz 以建立新帳戶")}
            className="ml-1 text-sm text-blue-600 hover:underline"
          >
            註冊新帳戶
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
