"use client";

import { signUpUser } from "@/firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    const result = await signUpUser(name, email, password);

    if (!result.success) {
      setError(result.message);
    } else {
      router.push("/home");
    }

    setLoading(false);
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <h2>Sign Up</h2>

        <form onSubmit={handleSubmit}>
          <input name="name" type="text" placeholder="Full Name" required />
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Password" required />

          {error && <p className="error-text">{error}</p>}

          <button className="signup-btn" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="form-footer">
          Already have an account? <a href="/login">Log in</a>
        </div>
      </div>

      <div className="footer">Made with ❤️ by Team Featherflow</div>
    </div>
  );
}
