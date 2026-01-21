"use client";

import { useState } from "react";
import PoliceSidebar from "@/components/police/PoliceSidebar";
import PoliceMobileNav from "@/components/police/PoliceMobileNav";
import CrimeReportsPanel from "@/components/police/CrimeReportsPanel";

export default function ReportsPage() {
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
            <PoliceSidebar activeScreen="reports" onSignOut={handleSignOut} />
          </div>

          {/* Main Content */}
          <div className="police-main-content">
            {/* Mobile Navigation */}
            <PoliceMobileNav activeScreen="reports" onSignOut={handleSignOut} />

            {/* Content Area */}
            <div className="police-content-area">
              <CrimeReportsPanel />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
