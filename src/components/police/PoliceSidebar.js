"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

const menuItems = [
  { id: "dashboard", label: "Dashboard", href: "/police" },
  { id: "reports", label: "Reports", href: "/police/reports" },
  { id: "sos", label: "SOS Alerts", href: "/police/sos" },
  { id: "heatmap", label: "Heatmap", href: "/police/heatmap" },
];

export default function PoliceSidebar({ activeScreen, onSignOut }) {
  const router = useRouter();

  const handleSignOut = () => {
    onSignOut?.();
    router.push("/login");
  };

  return (
    <div className="police-sidebar">
      {/* Logo/Header */}
      <div className="police-sidebar-header">
        <div className="police-logo-container">
          <div className="police-logo-icon">🛡️</div>
          <div>
            <h1>Daak Police</h1>
            <p>Officer Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="police-sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`police-nav-item ${activeScreen === item.id ? "police-nav-item-active" : ""}`}
          >
            <span>{item.label}</span>
            {item.id === "sos" && (
              <span className="police-nav-badge">2</span>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="police-sidebar-footer">
        <div className="police-officer-info">
          <div className="police-officer-label">Logged in as</div>
          <div className="police-officer-id">Officer ID: P-2847</div>
          <div className="police-officer-dept">Dhaka Metropolitan</div>
        </div>
        <button
          onClick={handleSignOut}
          className="police-sign-out-btn"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
