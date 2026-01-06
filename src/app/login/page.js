"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, sendPasswordReset } from "@/firebase/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();

  const res = await login(email, password);

  if (res.success) {
    router.push("/home");
  } else {
    alert(res.message || "Login failed.");
  }
};

const handlePasswordReset = async (e) => {
  e.preventDefault();

  const res = await sendPasswordReset(email);

  if (res.success) {
    alert(res.message || "Password reset email sent.");
  } else {
    alert(res.message || "Could not send reset email.");
  }
};


  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="h2-title">LOGIN</h2>

        <form
          id="loginForm"
          onSubmit={handleSubmit}
          className="login-form"
        >
          <input
            type="email"
            id="email"
            className="login-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            id="password"
            className="login-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <div className="login-footer">
          <a href="#" onClick={handlePasswordReset}>
            Forgot Password?
          </a>
          <a href="/signup">Sign Up</a>
        </div>

        <div className="login-credit">
          Made with ❤️ by Team Featherflow
        </div>
      </div>
    </div>
  );
}
