import { useState } from "react";
import { Map, Filter, Calendar, TrendingUp, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Badge } from "@/app/components/ui/badge";

interface CrimeHotspot {
  area: string;
  crimes: number;
  trend: "up" | "down" | "stable";
  types: { type: string; count: number }[];
}

const mockHotspots: CrimeHotspot[] = [
  {
    area: "Dhanmondi",
    crimes: 18,
    trend: "up",
    types: [
      { type: "Theft", count: 8 },
      { type: "Vandalism", count: 6 },
      { type: "Fraud", count: 4 }
    ]
  },
  {
    area: "Gulshan",
    crimes: 15,
    trend: "down",
    types: [
      { type: "Robbery", count: 7 },
      { type: "Assault", count: 5 },
      { type: "Theft", count: 3 }
    ]
  },
  {
    area: "Mirpur",
    crimes: 22,
    trend: "up",
    types: [
      { type: "Theft", count: 10 },
      { type: "Assault", count: 7 },
      { type: "Vandalism", count: 5 }
    ]
  },
  {
    area: "Uttara",
    crimes: 12,
    trend: "stable",
    types: [
      { type: "Fraud", count: 6 },
      { type: "Theft", count: 4 },
      { type: "Vandalism", count: 2 }
    ]
  },
  {
    area: "Banani",
    crimes: 9,
    trend: "down",
    types: [
      { type: "Theft", count: 5 },
      { type: "Vandalism", count: 3 },
      { type: "Fraud", count: 1 }
    ]
  }
];

export function CrimeHeatmap() {
  const [crimeType, setCrimeType] = useState("all");
  const [timeRange, setTimeRange] = useState("7days");

  const totalCrimes = mockHotspots.reduce((sum, spot) => sum + spot.crimes, 0);
  const highestArea = mockHotspots.reduce((max, spot) => spot.crimes > max.crimes ? spot : max);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-red-700">Crime Heatmap Analysis</h1>
        <p className="text-sm text-gray-500 mt-1">Data-driven crime pattern recognition and prevention</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={crimeType} onValueChange={setCrimeType}>
              <SelectTrigger className="w-full md:w-[250px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Crime Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Crime Types</SelectItem>
                <SelectItem value="theft">Theft</SelectItem>
                <SelectItem value="assault">Assault</SelectItem>
                <SelectItem value="robbery">Robbery</SelectItem>
                <SelectItem value="vandalism">Vandalism</SelectItem>
                <SelectItem value="fraud">Fraud</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full md:w-[250px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24hours">Last 24 Hours</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 3 Months</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-red-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-red-700">{totalCrimes}</div>
            <p className="text-xs text-gray-500 mt-1">In selected time range</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Highest Activity Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-700">{highestArea.area}</div>
            <p className="text-xs text-gray-500 mt-1">{highestArea.crimes} incidents</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Areas Monitored</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-red-700">{mockHotspots.length}</div>
            <p className="text-xs text-gray-500 mt-1">Active zones</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Large Heatmap */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <Map className="h-5 w-5" />
                Interactive Crime Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[600px] bg-gradient-to-br from-red-50 to-red-100 rounded-lg relative overflow-hidden">
                {/* Heatmap visualization - using positioned elements to simulate density */}
                
                {/* High intensity areas (red) */}
                <div className="absolute top-[20%] left-[35%] w-32 h-32 bg-red-600 rounded-full opacity-40 blur-2xl"></div>
                <div className="absolute top-[18%] left-[33%] w-24 h-24 bg-red-500 rounded-full opacity-50 blur-xl"></div>
                
                <div className="absolute top-[55%] left-[25%] w-40 h-40 bg-red-600 rounded-full opacity-40 blur-2xl"></div>
                <div className="absolute top-[53%] left-[23%] w-28 h-28 bg-red-500 rounded-full opacity-50 blur-xl"></div>
                
                {/* Medium intensity areas (orange/yellow) */}
                <div className="absolute top-[30%] right-[20%] w-36 h-36 bg-orange-500 rounded-full opacity-30 blur-2xl"></div>
                <div className="absolute top-[28%] right-[18%] w-24 h-24 bg-orange-400 rounded-full opacity-40 blur-xl"></div>
                
                <div className="absolute bottom-[25%] left-[45%] w-32 h-32 bg-yellow-500 rounded-full opacity-30 blur-2xl"></div>
                <div className="absolute bottom-[23%] left-[43%] w-20 h-20 bg-yellow-400 rounded-full opacity-40 blur-xl"></div>
                
                {/* Low intensity areas (green/red) */}
                <div className="absolute top-[15%] right-[35%] w-24 h-24 bg-red-400 rounded-full opacity-25 blur-2xl"></div>
                <div className="absolute bottom-[20%] right-[30%] w-28 h-28 bg-green-400 rounded-full opacity-25 blur-2xl"></div>
                
                {/* Area markers */}
                {mockHotspots.map((hotspot, index) => (
                  <div
                    key={hotspot.area}
                    className="absolute group"
                    style={{
                      top: `${15 + index * 18}%`,
                      left: `${25 + (index % 3) * 25}%`,
                    }}
                  >
                    <div className="relative">
                      <MapPin 
                        className={`h-6 w-6 cursor-pointer hover:scale-125 transition-transform ${
                          hotspot.crimes > 18 ? "text-red-700" :
                          hotspot.crimes > 12 ? "text-orange-600" :
                          "text-red-600"
                        }`}
                      />
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border whitespace-nowrap">
                          <div className="font-semibold text-red-700">{hotspot.area}</div>
                          <div className="text-sm text-gray-600">{hotspot.crimes} incidents</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center justify-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  <span className="text-sm text-gray-600">High (15+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-sm text-gray-600">Medium (8-14)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm text-gray-600">Low (1-7)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hotspot Analysis */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-700">Crime Hotspots</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockHotspots
                .sort((a, b) => b.crimes - a.crimes)
                .map((hotspot, index) => (
                  <div 
                    key={hotspot.area}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-red-700">
                            {index + 1}. {hotspot.area}
                          </span>
                          {hotspot.trend === "up" && (
                            <TrendingUp className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <Badge 
                          variant={
                            hotspot.crimes > 18 ? "destructive" :
                            hotspot.crimes > 12 ? "secondary" : "outline"
                          }
                          className={
                            hotspot.crimes > 12 && hotspot.crimes <= 18 ? "bg-amber-100 text-amber-700 border-amber-200" : ""
                          }
                        >
                          {hotspot.crimes} incidents
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {hotspot.types.slice(0, 3).map((type) => (
                        <div 
                          key={type.type}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-600">{type.type}</span>
                          <span className="text-gray-900 font-medium">{type.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* Trend Info */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">Pattern Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">Increasing Activity</span>
                </div>
                <p className="text-gray-600">Dhanmondi and Mirpur showing upward trend</p>
              </div>
              
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-medium text-green-700 mb-1">Improvement Noted</div>
                <p className="text-gray-600">Gulshan and Banani incidents decreasing</p>
              </div>
              
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="font-medium text-red-700 mb-1">Recommendation</div>
                <p className="text-gray-600">Increase patrol in high-activity zones</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
