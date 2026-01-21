"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PoliceSidebar from "./PoliceSidebar";

const menuItems = [
  { id: "dashboard", label: "Dashboard", href: "/police" },
  { id: "reports", label: "Reports", href: "/police/reports" },
  { id: "sos", label: "SOS Alerts", href: "/police/sos" },
  { id: "heatmap", label: "Heatmap", href: "/police/heatmap" },
];

export default function PoliceMobileNav({ activeScreen, onSignOut }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = () => {
    onSignOut?.();
    setOpen(false);
    router.push("/login");
  };

  return (
    <div className="police-mobile-nav">
      <div className="police-mobile-header">
        <div className="police-mobile-branding">
          <span className="police-mobile-logo">🛡️</span>
          <div>
            <h1>Daak Police</h1>
            <p>Officer Portal</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="police-mobile-menu-btn"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {open && (
        <div className="police-mobile-drawer">
          <nav className="police-mobile-nav-items">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`police-mobile-nav-item ${activeScreen === item.id ? "police-mobile-nav-item-active" : ""}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
                {item.id === "sos" && (
                  <span className="police-mobile-badge">2</span>
                )}
              </Link>
            ))}
          </nav>
          <div className="police-mobile-drawer-footer">
            <button
              onClick={handleSignOut}
              className="police-mobile-signout-btn"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
