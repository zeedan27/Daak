import { Shield } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";

interface LoginScreenProps {
  onLogin: (officerId: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin("P-2847");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#1a2b4a] rounded-full flex items-center justify-center">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-[#1a2b4a]">Daak Police Portal</CardTitle>
          <p className="text-sm text-gray-600 mt-2">Officer Authentication</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm">Officer ID</label>
              <Input 
                type="text" 
                placeholder="Enter your officer ID"
                defaultValue="P-2847"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Password</label>
              <Input 
                type="password" 
                placeholder="Enter your password"
                defaultValue="••••••••"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#1a2b4a] hover:bg-[#0f1a2e]"
            >
              Sign In
            </Button>
          </form>
          <div className="mt-6 text-center text-xs text-gray-500">
            Bangladesh Police Department • Dhaka Metropolitan
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
