import { AlertCircle, MapPin, FileText, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

interface Report {
  id: string;
  type: string;
  status: "Pending" | "Investigating" | "Resolved";
  time: string;
  location: string;
}

interface SOSAlert {
  id: string;
  time: string;
  location: string;
}

const mockReports: Report[] = [
  { id: "R001", type: "Theft", status: "Pending", time: "5 min ago", location: "Dhanmondi 27" },
  { id: "R002", type: "Assault", status: "Investigating", time: "12 min ago", location: "Gulshan 2" },
  { id: "R003", type: "Vandalism", status: "Pending", time: "18 min ago", location: "Banani" },
];

const mockSOSAlerts: SOSAlert[] = [
  { id: "SOS001", time: "2 min ago", location: "Dhanmondi Lake" },
  { id: "SOS002", time: "8 min ago", location: "Uttara Sector 7" },
];

export function PoliceDashboard({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#1a2b4a]">Command Center</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time monitoring</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#1a2b4a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-[#1a2b4a]">47</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Active Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-amber-600">23</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">SOS Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-red-600">2</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-green-600">18</div>
          </CardContent>
        </Card>
      </div>

      {/* SOS Alerts */}
      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Emergency SOS Alerts
            </CardTitle>
            <Button 
              onClick={() => onNavigate("sos")}
              size="sm"
              className="bg-red-600 hover:bg-red-700"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockSOSAlerts.map((alert) => (
            <div key={alert.id} className="bg-white p-4 rounded-lg border border-red-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-red-600 animate-pulse" />
                    <span className="font-medium text-[#1a2b4a]">{alert.id}</span>
                    <Badge variant="destructive">Active</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {alert.location}
                    </span>
                    <span>{alert.time}</span>
                  </div>
                </div>
                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                  Respond
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#1a2b4a] flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Reports
            </CardTitle>
            <Button 
              onClick={() => onNavigate("reports")}
              variant="outline" 
              size="sm"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockReports.map((report) => (
            <div 
              key={report.id}
              className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => onNavigate("reports")}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-[#1a2b4a]">{report.id}</span>
                    <Badge variant="outline">{report.type}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {report.location}
                    </span>
                    <span>{report.time}</span>
                  </div>
                </div>
                <Badge 
                  variant={
                    report.status === "Pending" ? "secondary" :
                    report.status === "Investigating" ? "default" : "outline"
                  }
                  className={
                    report.status === "Investigating" ? "bg-amber-100 text-amber-700 border-amber-200" : ""
                  }
                >
                  {report.status}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}