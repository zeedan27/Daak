import { useState } from "react";
import { FileText, MapPin, Clock, User, Image as ImageIcon, ChevronRight, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";

interface Report {
  id: string;
  type: string;
  status: "Pending" | "Investigating" | "Resolved";
  time: string;
  location: string;
  anonymous: boolean;
  description: string;
  hasMedia: boolean;
}

const mockReports: Report[] = [
  {
    id: "R001",
    type: "Theft",
    status: "Pending",
    time: "5 min ago",
    location: "Dhanmondi 27, Dhaka",
    anonymous: true,
    description: "Motorcycle theft reported near Rabindra Sarobar.",
    hasMedia: true
  },
  {
    id: "R002",
    type: "Assault",
    status: "Investigating",
    time: "12 min ago",
    location: "Gulshan 2, Dhaka",
    anonymous: false,
    description: "Physical altercation near Gulshan Lake Park.",
    hasMedia: true
  },
  {
    id: "R003",
    type: "Vandalism",
    status: "Pending",
    time: "18 min ago",
    location: "Banani, Dhaka",
    anonymous: true,
    description: "Property damage to public signage.",
    hasMedia: false
  },
  {
    id: "R004",
    type: "Robbery",
    status: "Investigating",
    time: "25 min ago",
    location: "Mirpur 10, Dhaka",
    anonymous: false,
    description: "Armed robbery at local shop.",
    hasMedia: true
  },
  {
    id: "R005",
    type: "Fraud",
    status: "Resolved",
    time: "1 hour ago",
    location: "Uttara, Dhaka",
    anonymous: true,
    description: "Online scam reported.",
    hasMedia: false
  },
];

export function CrimeReports() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReports = mockReports.filter(report => {
    const matchesStatus = filterStatus === "all" || report.status === filterStatus;
    const matchesSearch = report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#1a2b4a]">Crime Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Review and manage citizen reports</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Investigating">Investigating</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="grid gap-4">
        {filteredReports.map((report) => (
          <Card 
            key={report.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedReport(report)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-[#1a2b4a]">{report.id}</span>
                    <Badge variant="outline">{report.type}</Badge>
                    {report.anonymous && (
                      <Badge variant="secondary" className="text-xs">
                        <User className="h-3 w-3 mr-1" />
                        Anonymous
                      </Badge>
                    )}
                    {report.hasMedia && (
                      <Badge variant="outline" className="text-xs">
                        <ImageIcon className="h-3 w-3 mr-1" />
                        Media
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {report.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {report.time}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700">{report.description}</p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <Badge 
                    variant={
                      report.status === "Pending" ? "secondary" :
                      report.status === "Investigating" ? "default" : "outline"
                    }
                    className={
                      report.status === "Investigating" ? "bg-amber-100 text-amber-700 border-amber-200" :
                      report.status === "Resolved" ? "bg-green-100 text-green-700 border-green-200" : ""
                    }
                  >
                    {report.status}
                  </Badge>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Detail Dialog */}
      <Dialog open={selectedReport !== null} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="text-[#1a2b4a] flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Report {selectedReport.id}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  Review and update the status of the report.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{selectedReport.type}</Badge>
                  {selectedReport.anonymous && (
                    <Badge variant="secondary">Anonymous</Badge>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-600">Location</label>
                  <p className="mt-1 text-[#1a2b4a]">{selectedReport.location}</p>
                </div>

                {/* Location Map */}
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Location Map</label>
                  <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border relative overflow-hidden">
                    {/* Map background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="grid grid-cols-8 grid-rows-6 h-full">
                        {Array.from({ length: 48 }).map((_, i) => (
                          <div key={i} className="border border-gray-400"></div>
                        ))}
                      </div>
                    </div>
                    {/* Location marker */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <MapPin className="h-8 w-8 text-red-600 animate-pulse" />
                      <div className="absolute inset-0 bg-red-600 rounded-full opacity-25 animate-ping"></div>
                    </div>
                    {/* Location label */}
                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md">
                      <span className="text-xs font-medium text-[#1a2b4a]">{selectedReport.location}</span>
                    </div>
                  </div>
                </div>

                {/* Suspect Image */}
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Suspect Image</label>
                  <div className="h-64 bg-gray-100 rounded-lg border flex items-center justify-center relative overflow-hidden">
                    <div className="text-center">
                      <User className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Suspect photo from witness</p>
                    </div>
                    {/* Optional: Badge overlay if available */}
                    <div className="absolute top-3 right-3">
                      <Badge variant="outline" className="bg-white">
                        Evidence Photo
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Description</label>
                  <p className="mt-2 text-gray-800">{selectedReport.description}</p>
                </div>

                {selectedReport.hasMedia && (
                  <div>
                    <label className="text-sm text-gray-600">Media Attachments</label>
                    <div className="mt-2 h-32 bg-gray-100 rounded-lg flex items-center justify-center border">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <Select defaultValue={selectedReport.status}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Investigating">Investigating</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="flex-1 bg-[#1a2b4a] hover:bg-[#0f1a2e]">
                    Update Status
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