"use client";

import { useState, useEffect } from "react";
import { firestore } from "@/firebase/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function CrimeReportsPanel() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const mapRef = { current: null };

  // Fetch reports from Firestore
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const reportsRef = collection(firestore, "reports");
        const snapshot = await getDocs(reportsRef);

        const reportsData = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const reportTime = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
          const timeDiff = Math.floor((new Date() - reportTime) / 60000);
          let timeAgo = "just now";
          if (timeDiff >= 60) {
            timeAgo = `${Math.floor(timeDiff / 60)}h ago`;
          } else if (timeDiff > 0) {
            timeAgo = `${timeDiff}m ago`;
          }

          return {
            id: docSnap.id,
            docId: docSnap.id,
            type: data.crimeType || "Unknown",
            status: data.status || "Pending",
            time: timeAgo,
            location: data.region || data.streetAddress || "Unknown Location",
            area: data.area || "N/A",
            anonymous: data.isAnonymous || false,
            description: data.description || "No description provided",
            hasMedia: (data.mediaUrls && data.mediaUrls.length > 0) || false,
            mediaUrls: data.mediaUrls || [],
            reporterName: data.reporterName || "Anonymous",
            latitude: data.latitude,
            longitude: data.longitude,
            userId: data.userId,
          };
        });

        console.log(`[Police Reports] Fetched ${reportsData.length} reports`);
        setReports(reportsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching reports:", error);
        setLoading(false);
      }
    };

    fetchReports();
    const interval = setInterval(fetchReports, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Initialize map for selected report
  useEffect(() => {
    if (selectedReport && selectedReport.latitude && selectedReport.longitude) {
      setTimeout(() => {
        const mapId = `police-map-${selectedReport.docId}`;
        const mapElement = document.getElementById(mapId);

        if (mapElement && !mapElement.leafletMap) {
          try {
            const map = L.map(mapElement).setView(
              [selectedReport.latitude, selectedReport.longitude],
              15
            );

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              maxZoom: 19,
            }).addTo(map);

            L.marker([selectedReport.latitude, selectedReport.longitude])
              .addTo(map)
              .bindPopup(
                `<strong>${selectedReport.type}</strong><br>${selectedReport.location}`
              )
              .openPopup();

            mapElement.leafletMap = map;
            console.log(`[Police Reports] Initialized map for report ${selectedReport.docId}`);
          } catch (error) {
            console.error("[Police Reports] Error initializing map:", error);
          }
        }
      }, 0);
    }

    return () => {
      if (selectedReport) {
        const mapId = `police-map-${selectedReport.docId}`;
        const mapElement = document.getElementById(mapId);
        if (mapElement && mapElement.leafletMap) {
          mapElement.leafletMap.remove();
          delete mapElement.leafletMap;
        }
      }
    };
  }, [selectedReport]);

  // Handle status update
  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      setUpdatingStatus(reportId);
      console.log(`[Police Reports] Updating report ${reportId} to status: ${newStatus}`);
      
      const reportRef = doc(firestore, "reports", reportId);
      await updateDoc(reportRef, { status: newStatus });

      // Update local state
      setReports((prev) =>
        prev.map((r) => (r.docId === reportId ? { ...r, status: newStatus } : r))
      );

      if (selectedReport?.docId === reportId) {
        setSelectedReport({ ...selectedReport, status: newStatus });
      }

      console.log(`[Police Reports] ✅ Report ${reportId} status updated to ${newStatus}`);
      alert(`Report status updated to ${newStatus}`);
    } catch (error) {
      console.error("[Police Reports] ❌ Error updating status:", error);
      console.error("[Police Reports] Error code:", error.code);
      console.error("[Police Reports] Error message:", error.message);
      
      // Provide specific error messages
      let errorMsg = "Failed to update report status";
      if (error.code === "permission-denied") {
        errorMsg = "Permission denied. Check Firestore security rules.";
      } else if (error.code === "not-found") {
        errorMsg = "Report not found.";
      }
      
      alert(errorMsg);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesStatus = filterStatus === "all" || report.status === filterStatus;
    const matchesSearch =
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="police-reports-panel">
      {/* Header */}
      <div className="police-page-header">
        <h1>Crime Reports</h1>
        <p>Review and manage citizen reports</p>
      </div>

      {/* Filters */}
      <div className="police-filters-card">
        <div className="police-filter-row">
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="police-search-input"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="police-filter-select"
          >
            <option value="all">All Reports</option>
            <option value="Pending">Pending</option>
            <option value="Investigating">Investigating</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="police-reports-container">
          <p className="police-loading-text">Loading reports...</p>
        </div>
      )}

      {/* No Reports */}
      {!loading && reports.length === 0 && (
        <div className="police-reports-container">
          <p className="police-loading-text">No reports available</p>
        </div>
      )}

      {/* Reports List */}
      {!loading && reports.length > 0 && (
        <div className="police-reports-container">
          {filteredReports.map((report) => (
            <div
              key={report.docId}
              className="police-report-card"
              onClick={() => setSelectedReport(report)}
            >
              <div className="police-report-card-content">
                <div className="police-report-card-left">
                  <div className="police-report-card-header">
                    <span className="police-report-id">{report.id}</span>
                    <span className="police-report-type">{report.type}</span>
                    {report.anonymous && (
                      <span className="police-report-anonymous">Anonymous</span>
                    )}
                    {report.hasMedia && (
                      <span className="police-report-media">📷 Media</span>
                    )}
                  </div>
                  <div className="police-report-meta">
                    <span>📍 {report.location}</span>
                    <span>{report.time}</span>
                  </div>
                  <p className="police-report-desc">{report.description}</p>
                </div>
                <div className="police-report-card-right">
                  <span
                    className={`police-report-status police-status-${report.status
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {report.status}
                  </span>
                  <span className="police-report-arrow">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="police-modal-overlay" onClick={() => setSelectedReport(null)}>
          <div
            className="police-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="police-modal-close"
              onClick={() => setSelectedReport(null)}
            >
              ✕
            </button>

            <div className="police-modal-header">
              <h2>📄 Report {selectedReport.id}</h2>
              <p>Review and update the status of the report.</p>
            </div>

            <div className="police-modal-body">
              <div className="police-modal-badges">
                <span className="police-badge">{selectedReport.type}</span>
                {selectedReport.anonymous && (
                  <span className="police-badge police-badge-anon">Anonymous</span>
                )}
              </div>

              <div className="police-modal-section">
                <label>Reporter</label>
                <p>{selectedReport.reporterName}</p>
              </div>

              <div className="police-modal-section">
                <label>Location</label>
                <p>
                  📍 {selectedReport.location} {selectedReport.area && `(${selectedReport.area})`}
                </p>
              </div>

              {selectedReport.latitude && selectedReport.longitude && (
                <div className="police-modal-section">
                  <label>Location Map</label>
                  <div
                    id={`police-map-${selectedReport.docId}`}
                    className="police-location-map"
                    style={{ height: "300px", width: "100%", borderRadius: "8px" }}
                  />
                </div>
              )}

              <div className="police-modal-section">
                <label>Description</label>
                <p>{selectedReport.description}</p>
              </div>

              {selectedReport.hasMedia && selectedReport.mediaUrls.length > 0 && (
                <div className="police-modal-section">
                  <label>Media Attachments ({selectedReport.mediaUrls.length})</label>
                  <div className="police-media-grid">
                    {selectedReport.mediaUrls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="police-media-item"
                      >
                        📷 View Media {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="police-modal-actions">
                <select
                  className="police-status-select"
                  defaultValue={selectedReport.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    handleStatusUpdate(selectedReport.docId, newStatus);
                  }}
                  disabled={updatingStatus === selectedReport.docId}
                >
                  <option value="Pending">Pending</option>
                  <option value="Investigating">Investigating</option>
                  <option value="Resolved">Resolved</option>
                </select>
                <button
                  className="police-action-btn"
                  disabled={updatingStatus === selectedReport.docId}
                >
                  {updatingStatus === selectedReport.docId
                    ? "Updating..."
                    : "Update Status"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
