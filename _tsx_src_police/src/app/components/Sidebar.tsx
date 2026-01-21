import { LayoutDashboard, FileText, AlertTriangle, Map, MessageSquare, Shield, LogOut } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Separator } from "@/app/components/ui/separator";

interface SidebarProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
  onSignOut: () => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "sos", label: "SOS Alerts", icon: AlertTriangle },
  { id: "heatmap", label: "Heatmap", icon: Map },
];

export function Sidebar({ activeScreen, onNavigate, onSignOut }: SidebarProps) {
  return (
    <div className="w-64 bg-[#1a2b4a] text-white h-screen flex flex-col sticky top-0">
      {/* Logo/Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8" />
          <div>
            <h1 className="font-semibold text-xl">Daak Police</h1>
            <p className="text-xs text-blue-200">Officer Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-white text-[#1a2b4a] font-medium shadow-lg"
                  : "text-blue-100 hover:bg-white/10"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
              {item.id === "sos" && (
                <span className="ml-auto bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                  2
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/10">
        <div className="mb-4 p-3 bg-white/5 rounded-lg">
          <div className="text-xs text-blue-200 mb-1">Logged in as</div>
          <div className="font-medium">Officer ID: P-2847</div>
          <div className="text-xs text-blue-200">Dhaka Metropolitan</div>
        </div>
        <Button 
          onClick={onSignOut}
          variant="ghost" 
          className="w-full justify-start text-blue-100 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}