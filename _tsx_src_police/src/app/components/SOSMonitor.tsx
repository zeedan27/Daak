import { useState } from "react";
import { AlertTriangle, MapPin, Clock, Phone, Radio } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";

interface SOSAlert {
  id: string;
  time: string;
  location: string;
  status: "Active" | "Dispatched";
}

const mockSOSAlerts: SOSAlert[] = [
  {
    id: "SOS001",
    time: "2 min ago",
    location: "Dhanmondi Lake",
    status: "Active"
  },
  {
    id: "SOS002",
    time: "8 min ago",
    location: "Uttara Sector 7",
    status: "Dispatched"
  },
  {
    id: "SOS003",
    time: "15 min ago",
    location: "Mohakhali DOHS",
    status: "Active"
  },
];

export function SOSMonitor() {
  const [selectedAlert, setSelectedAlert] = useState<SOSAlert | null>(null);

  const activeAlerts = mockSOSAlerts.filter(a => a.status === "Active");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 animate-pulse" />
            Emergency SOS Monitor
          </h1>
          <p className="text-sm text-gray-500 mt-1">Real-time emergency response</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-semibold text-red-600">{activeAlerts.length}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {activeAlerts.length > 0 && (
        <Card className="bg-red-600 text-white border-red-700">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 animate-pulse" />
                <div>
                  <div className="font-semibold">{activeAlerts.length} Active Emergency Alert{activeAlerts.length > 1 ? 's' : ''}</div>
                  <div className="text-sm text-red-100">Immediate response required</div>
                </div>
              </div>
              <Button 
                variant="secondary" 
                className="bg-white text-red-600 hover:bg-red-50"
              >
                <Radio className="h-4 w-4 mr-2" />
                Dispatch
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SOS Alerts List */}
      <div className="grid gap-4">
        {mockSOSAlerts.map((alert) => (
          <Card 
            key={alert.id} 
            className={`hover:shadow-lg transition-shadow cursor-pointer ${
              alert.status === "Active" ? "border-red-300 bg-red-50" : "border-amber-200 bg-amber-50"
            }`}
            onClick={() => setSelectedAlert(alert)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-5 w-5 ${
                      alert.status === "Active" ? "text-red-600 animate-pulse" : "text-amber-600"
                    }`} />
                    <span className={`font-semibold ${
                      alert.status === "Active" ? "text-red-700" : "text-amber-900"
                    }`}>{alert.id}</span>
                    <Badge 
                      variant={alert.status === "Active" ? "destructive" : "secondary"}
                      className={alert.status === "Active" ? "animate-pulse" : "bg-amber-100 text-amber-700 border-amber-200"}
                    >
                      {alert.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">{alert.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      {alert.time}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {alert.status === "Active" && (
                    <Button 
                      size="sm" 
                      className="bg-red-600 hover:bg-red-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Radio className="h-4 w-4 mr-1" />
                      Respond
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert Detail Dialog */}
      <Dialog open={selectedAlert !== null} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-xl">
          {selectedAlert && (
            <>
              <DialogHeader>
                <DialogTitle className="text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6" />
                  {selectedAlert.id}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <Badge 
                  variant={selectedAlert.status === "Active" ? "destructive" : "secondary"}
                  className={selectedAlert.status === "Dispatched" ? "bg-amber-100 text-amber-700 border-amber-200" : ""}
                >
                  {selectedAlert.status}
                </Badge>

                <div>
                  <label className="text-sm text-gray-600">Location</label>
                  <p className="mt-1 text-[#1a2b4a] font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {selectedAlert.location}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Time</label>
                  <p className="mt-1 text-gray-700">{selectedAlert.time}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Live Location</label>
                  <div className="h-48 bg-gradient-to-br from-red-50 to-red-100 rounded-lg flex items-center justify-center relative">
                    <div className="w-6 h-6 bg-red-600 rounded-full animate-pulse absolute">
                      <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-75"></div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button className="flex-1 bg-[#1a2b4a] hover:bg-[#0f1a2e]">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                  <Button className="flex-1 bg-red-600 hover:bg-red-700">
                    <Radio className="h-4 w-4 mr-2" />
                    Dispatch
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}