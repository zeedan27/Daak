"use client";

import { useState } from "react";
import PoliceSidebar from "@/components/police/PoliceSidebar";
import PoliceMobileNav from "@/components/police/PoliceMobileNav";
import CrimeHeatmapPanel from "@/components/police/CrimeHeatmapPanel";

export default function HeatmapPage() {
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
            <PoliceSidebar activeScreen="heatmap" onSignOut={handleSignOut} />
          </div>

          {/* Main Content */}
          <div className="police-main-content">
            {/* Mobile Navigation */}
            <PoliceMobileNav activeScreen="heatmap" onSignOut={handleSignOut} />

            {/* Content Area */}
            <div className="police-content-area">
              <CrimeHeatmapPanel />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
