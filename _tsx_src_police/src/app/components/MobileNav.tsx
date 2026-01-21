import { useState } from "react";
import { Menu, X, Shield } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/app/components/ui/sheet";
import { Sidebar } from "@/app/components/Sidebar";

interface MobileNavProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
  onSignOut: () => void;
}

export function MobileNav({ activeScreen, onNavigate, onSignOut }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  const handleNavigate = (screen: string) => {
    onNavigate(screen);
    setOpen(false);
  };

  return (
    <div className="lg:hidden bg-[#1a2b4a] text-white p-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <div>
          <h1 className="font-semibold">Daak Police</h1>
          <p className="text-xs text-blue-200">Officer Portal</p>
        </div>
      </div>
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="inline-flex items-center justify-center rounded-md text-white hover:bg-white/10 p-2 transition-colors">
            <Menu className="h-6 w-6" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar activeScreen={activeScreen} onNavigate={handleNavigate} onSignOut={onSignOut} />
        </SheetContent>
      </Sheet>
    </div>
  );
}