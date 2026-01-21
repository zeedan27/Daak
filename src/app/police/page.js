"use client";

import { useState } from "react";
import PoliceSidebar from "@/components/police/PoliceSidebar";
import PoliceMobileNav from "@/components/police/PoliceMobileNav";
import PoliceDashboard from "@/components/police/PoliceDashboard";

export default function PoliceMainPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const handleSignOut = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="police-page">
      {isLoggedIn && (
        <>
          {/* Desktop Sidebar */}
          <div className="police-desktop-sidebar">
            <PoliceSidebar activeScreen="dashboard" onSignOut={handleSignOut} />
          </div>

          {/* Main Content */}
          <div className="police-main-content">
            {/* Mobile Navigation */}
            <PoliceMobileNav activeScreen="dashboard" onSignOut={handleSignOut} />

            {/* Content Area */}
            <div className="police-content-area">
              <PoliceDashboard />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
