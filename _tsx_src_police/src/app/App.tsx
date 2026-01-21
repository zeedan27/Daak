import { useState } from "react";
import { Sidebar } from "@/app/components/Sidebar";
import { MobileNav } from "@/app/components/MobileNav";
import { LoginScreen } from "@/app/components/LoginScreen";
import { PoliceDashboard } from "@/app/components/PoliceDashboard";
import { CrimeReports } from "@/app/components/CrimeReports";
import { SOSMonitor } from "@/app/components/SOSMonitor";
import { CrimeHeatmap } from "@/app/components/CrimeHeatmap";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const [officerId, setOfficerId] = useState("");

  const handleLogin = (id: string) => {
    setOfficerId(id);
    setIsLoggedIn(true);
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setOfficerId("");
    setActiveScreen("dashboard");
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case "dashboard":
        return <PoliceDashboard onNavigate={setActiveScreen} />;
      case "reports":
        return <CrimeReports />;
      case "sos":
        return <SOSMonitor />;
      case "heatmap":
        return <CrimeHeatmap />;
      default:
        return <PoliceDashboard onNavigate={setActiveScreen} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar 
          activeScreen={activeScreen} 
          onNavigate={setActiveScreen} 
          onSignOut={handleSignOut}
        />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Navigation */}
        <MobileNav 
          activeScreen={activeScreen} 
          onNavigate={setActiveScreen}
          onSignOut={handleSignOut}
        />
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {renderScreen()}
        </div>
      </div>
    </div>
  );
}