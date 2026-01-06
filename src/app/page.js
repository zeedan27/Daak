"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function IndexPage() {
  const router = useRouter();

  return (
    <div className="index-page">
      {/* Glass Header */}
      <header className="glass-header">
        <div className="left">
          <button onClick={() => router.back()} className="header-btn">← Back</button>
          <img src="/assets/images/logo.png" alt="Daak Logo" className="header-logo" />
          <span className="daak-title">ডাক</span>
        </div>
        <div className="right">
          <Link href="/signup" className="header-btn">Sign Up</Link>
        </div>
      </header>

      {/* Main Card */}
      <div className="card">
        <img src="/assets/images/logo.png" alt="Daak Logo" className="logo" />
        <h1>ডাক</h1>
        <p>When nobody hears, we do.</p>

        <button className="btn login" onClick={() => router.push("/login")}>Login</button>
        <button className="btn signup" onClick={() => router.push("/signup")}>Sign Up</button>
      </div>

      {/* Footer */}
      <div className="footer">Made with ❤️ by "Team Featherflow"</div>
    </div>
  );
}