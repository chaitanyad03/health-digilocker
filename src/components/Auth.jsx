import React, { useState } from "react";
import { supabase } from "../supabase"
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleAuth = async () => {
    if (!email || !password) {
      alert("Email and password are required.");
      return;
    }

    try {
      let { error } = isLogin
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (error) {
        alert(error.message);
      } else {
        alert("Success!");
        navigate("/upload");
      }
    } catch (err) {
      alert("Something went wrong.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 text-blue-800">
      <h2 className="text-3xl font-bold mb-4">
        {isLogin ? "Login to HealthDigiLocker" : "Register to Get Started"}
      </h2>

      <div className="w-full max-w-md space-y-4 px-6">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border border-blue-300 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border border-blue-300 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleAuth}
          className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition"
        >
          {isLogin ? "Login" : "Register"}
        </button>

        <p
          className="text-center text-sm underline cursor-pointer"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
};

export default Auth;
