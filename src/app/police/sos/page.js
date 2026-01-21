"use client";

import { useState } from "react";
import PoliceSidebar from "@/components/police/PoliceSidebar";
import PoliceMobileNav from "@/components/police/PoliceMobileNav";
import SOSMonitorPanel from "@/components/police/SOSMonitorPanel";

export default function SOSPage() {
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
            <PoliceSidebar activeScreen="sos" onSignOut={handleSignOut} />
          </div>

          {/* Main Content */}
          <div className="police-main-content">
            {/* Mobile Navigation */}
            <PoliceMobileNav activeScreen="sos" onSignOut={handleSignOut} />

            {/* Content Area */}
            <div className="police-content-area">
              <SOSMonitorPanel />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
