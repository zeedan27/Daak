"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { firestore } from "@/firebase/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export default function PoliceDashboard() {
  const [sosAlerts, setSOSAlerts] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [respondingId, setRespondingId] = useState(null);

  // Fetch SOS alerts from Firestore
  useEffect(() => {
    const fetchSOSAlerts = async () => {
      try {
        setLoading(true);
        const alertsRef = collection(firestore, "distressSignals");
        const snapshot = await getDocs(alertsRef);

        console.log(`[Dashboard] ✓ Fetched ${snapshot.docs.length} distress signals`);

        const alerts = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data();
            const alertTime = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
            const timeDiff = Math.floor((new Date() - alertTime) / 60000);
            let timeAgo = "just now";
            if (timeDiff >= 60) {
              timeAgo = `${Math.floor(timeDiff / 60)}h ago`;
            } else if (timeDiff > 0) {
              timeAgo = `${timeDiff}m ago`;
            }

            return {
              id: docSnap.id,
              docId: docSnap.id,
              time: timeAgo,
              location: data.location || "Unknown Location",
              status: data.policeStatus || "Active",
            };
          })
          .filter((a) => a.status === "Active")
          .slice(0, 2); // Show only top 2 active alerts on dashboard

        console.log(`[Dashboard] ✓ Active SOS alerts after filter: ${alerts.length}`);
        alerts.forEach((a) => {
          console.log(`  - ${a.docId}: ${a.location} (${a.time})`);
        });
        
        setSOSAlerts(alerts);
        setLoading(false);
      } catch (error) {
        console.error("[Dashboard] ❌ Error fetching SOS alerts:", error);
        console.error("[Dashboard] Error code:", error.code);
        setLoading(false);
      }
    };

    fetchSOSAlerts();
    const interval = setInterval(fetchSOSAlerts, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch recent reports from Firestore
  useEffect(() => {
    const fetchRecentReports = async () => {
      try {
        setReportsLoading(true);
        const reportsRef = collection(firestore, "reports");
        const snapshot = await getDocs(reportsRef);

        console.log(`[Dashboard] Fetched ${snapshot.docs.length} reports`);

        const reports = snapshot.docs
          .map((docSnap) => {
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
              id: `R${docSnap.id.substring(0, 5).toUpperCase()}`,
              docId: docSnap.id,
              type: data.crimeType || "Unknown",
              status: data.status || "Pending",
              time: timeAgo,
              location: data.streetAddress || data.area || "Unknown Location",
            };
          })
          .sort((a, b) => {
            const timeA = parseInt(a.time) || 0;
            const timeB = parseInt(b.time) || 0;
            return timeB - timeA;
          })
          .slice(0, 5); // Show only top 5 recent reports

        console.log("[Dashboard] Recent reports:", reports);
        setRecentReports(reports);
        setReportsLoading(false);
      } catch (error) {
        console.error("[Dashboard] Error fetching reports:", error);
        setReportsLoading(false);
      }
    };

    fetchRecentReports();
    const interval = setInterval(fetchRecentReports, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Handle Respond
  const handleRespond = async (alertId, e) => {
    e.stopPropagation();
    try {
      setRespondingId(alertId);
      const alertRef = doc(firestore, "distressSignals", alertId);
      await updateDoc(alertRef, {
        policeStatus: "Responded",
        respondedAt: new Date(),
      });

      // Update local state
      setSOSAlerts((prev) => prev.filter((a) => a.docId !== alertId));
    } catch (error) {
      console.error("Error responding to alert:", error);
    } finally {
      setRespondingId(null);
    }
  };
  return (
    <div className="police-dashboard-content">
      {/* Header */}
      <div className="police-page-header">
        <h1>Command Center</h1>
        <p>Real-time monitoring</p>
      </div>

      {/* Stats Cards */}
      <div className="police-stats-grid">
        <div className="police-stat-card police-stat-card-primary">
          <div className="police-stat-header">Total Reports</div>
          <div className="police-stat-value">47</div>
        </div>

        <div className="police-stat-card police-stat-card-warning">
          <div className="police-stat-header">Active Cases</div>
          <div className="police-stat-value">23</div>
        </div>

        <div className="police-stat-card police-stat-card-danger">
          <div className="police-stat-header">SOS Alerts</div>
          <div className="police-stat-value">{sosAlerts.length}</div>
        </div>

        <div className="police-stat-card police-stat-card-success">
          <div className="police-stat-header">Resolved</div>
          <div className="police-stat-value">18</div>
        </div>
      </div>

      {/* SOS Alerts */}
      <div className="police-sos-section">
        <div className="police-section-header">
          <div>
            <h2>⚠️ Emergency SOS Alerts</h2>
          </div>
          <Link href="/police/sos" className="police-link-btn">
            View All
          </Link>
        </div>
        {loading ? (
          <div className="police-alerts-list">
            <p className="police-loading-text">Loading alerts...</p>
          </div>
        ) : sosAlerts.length === 0 ? (
          <div className="police-alerts-list">
            <p className="police-loading-text">✓ No active SOS alerts</p>
          </div>
        ) : (
          <div className="police-alerts-list">
            {sosAlerts.map((alert) => (
              <div key={alert.docId} className="police-sos-alert">
                <div className="police-alert-content">
                  <div className="police-alert-header">
                    <span className="police-alert-pulse">🔴</span>
                    <span className="police-alert-id">{alert.id || alert.docId}</span>
                    <span className="police-alert-badge">Active</span>
                  </div>
                  <div className="police-alert-details">
                    <span>📍 {alert.location}</span>
                    <span>{alert.time}</span>
                  </div>
                </div>
                <button
                  className="police-respond-btn"
                  onClick={(e) => handleRespond(alert.docId, e)}
                  disabled={respondingId === alert.docId}
                >
                  {respondingId === alert.docId ? "Responding..." : "Respond"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Reports */}
      <div className="police-reports-section">
        <div className="police-section-header">
          <div>
            <h2>📄 Recent Reports</h2>
          </div>
          <Link href="/police/reports" className="police-link-btn">
            View All
          </Link>
        </div>
        {reportsLoading ? (
          <div className="police-reports-list">
            <p className="police-loading-text">Loading reports...</p>
          </div>
        ) : recentReports.length === 0 ? (
          <div className="police-reports-list">
            <p className="police-loading-text">No recent reports</p>
          </div>
        ) : (
          <div className="police-reports-list">
            {recentReports.map((report) => (
              <Link
                key={report.docId}
                href="/police/reports"
                className="police-report-item"
              >
                <div className="police-report-header">
                  <span className="police-report-id">{report.id}</span>
                  <span className="police-report-type">{report.type}</span>
                </div>
                <div className="police-report-details">
                  <span>📍 {report.location}</span>
                  <span>{report.time}</span>
                </div>
                <span className={`police-report-status police-status-${report.status.toLowerCase().replace(/\s+/g, "-")}`}>
                  {report.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
