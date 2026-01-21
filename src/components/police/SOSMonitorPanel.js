"use client";

import { useState, useEffect } from "react";
import { firestore } from "@/firebase/firebase";
import { collection, getDocs, updateDoc, doc, query, where } from "firebase/firestore";

export default function SOSMonitorPanel() {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [sosAlerts, setSOSAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dispatchingId, setDispatchingId] = useState(null);
  const [respondingId, setRespondingId] = useState(null);

  // Fetch SOS alerts from Firestore
  useEffect(() => {
    const fetchSOSAlerts = async () => {
      try {
        setLoading(true);
        const alertsRef = collection(firestore, "distressSignals");
        const snapshot = await getDocs(alertsRef);

        console.log(`[SOS Monitor] ✓ Fetched ${snapshot.docs.length} distress signals from Firestore`);

        const alerts = snapshot.docs.map((docSnap) => {
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
            userPhone: data.userPhone || "N/A",
            userData: data,
          };
        });

        console.log(`[SOS Monitor] Alerts in collection: ${alerts.length}`);
        alerts.forEach((a, i) => {
          console.log(`  [${i}] ${a.docId} - Status: ${a.status} - Location: ${a.location}`);
        });

        setSOSAlerts(alerts);
        setLoading(false);
      } catch (error) {
        console.error("[SOS Monitor] ❌ Error fetching SOS alerts:", error);
        console.error("[SOS Monitor] Error code:", error.code);
        console.error("[SOS Monitor] Error message:", error.message);
        setLoading(false);
      }
    };

    fetchSOSAlerts();
    const interval = setInterval(fetchSOSAlerts, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Handle Dispatch
  const handleDispatch = async (alert, e) => {
    e.stopPropagation();
    try {
      setDispatchingId(alert.docId);
      const alertRef = doc(firestore, "distressSignals", alert.docId);
      await updateDoc(alertRef, {
        policeStatus: "Dispatched",
        dispatchedAt: new Date(),
      });

      // Update local state
      setSOSAlerts((prev) =>
        prev.map((a) =>
          a.docId === alert.docId ? { ...a, status: "Dispatched" } : a
        )
      );

      if (selectedAlert?.docId === alert.docId) {
        setSelectedAlert({ ...selectedAlert, status: "Dispatched" });
      }
    } catch (error) {
      console.error("Error dispatching alert:", error);
    } finally {
      setDispatchingId(null);
    }
  };

  // Handle Respond
  const handleRespond = async (alert, e) => {
    e.stopPropagation();
    try {
      setRespondingId(alert.docId);
      const alertRef = doc(firestore, "distressSignals", alert.docId);
      await updateDoc(alertRef, {
        policeStatus: "Responded",
        respondedAt: new Date(),
      });

      // Update local state
      setSOSAlerts((prev) =>
        prev.map((a) =>
          a.docId === alert.docId ? { ...a, status: "Responded" } : a
        )
      );

      if (selectedAlert?.docId === alert.docId) {
        setSelectedAlert({ ...selectedAlert, status: "Responded" });
      }
    } catch (error) {
      console.error("Error responding to alert:", error);
    } finally {
      setRespondingId(null);
    }
  };

  const activeAlerts = sosAlerts.filter(a => a.status === "Active");

  return (
    <div className="police-sos-monitor">
      {/* Header */}
      <div className="police-sos-header">
        <div>
          <h1>⚠️ Emergency SOS Monitor</h1>
          <p>Real-time emergency response</p>
        </div>
        <div className="police-sos-counter">
          <div className="police-sos-count">{activeAlerts.length}</div>
          <div>Active</div>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {activeAlerts.length > 0 && (
        <div className="police-critical-banner">
          <div className="police-banner-icon">⚠️</div>
          <div>
            <div className="police-banner-title">
              {activeAlerts.length} Active Emergency Alert{activeAlerts.length > 1 ? "s" : ""}
            </div>
            <div className="police-banner-subtitle">Immediate response required</div>
          </div>
          <button
            className="police-dispatch-btn"
            onClick={() => {
              if (activeAlerts.length > 0) {
                handleDispatch(activeAlerts[0], { stopPropagation: () => {} });
              }
            }}
            disabled={dispatchingId !== null}
          >
            {dispatchingId ? "📡 Dispatching..." : "📡 Dispatch"}
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="police-loading-state">
          <p>Loading SOS alerts...</p>
        </div>
      )}

      {/* No Alerts */}
      {!loading && sosAlerts.length === 0 && (
        <div className="police-no-alerts">
          <p>✓ No active SOS alerts</p>
        </div>
      )}

      {/* SOS Alerts List */}
      {!loading && sosAlerts.length > 0 && (
        <div className="police-sos-alerts-list">
          {sosAlerts.map((alert) => (
            <div
              key={alert.docId}
              className={`police-sos-item ${
                alert.status === "Active"
                  ? "police-sos-item-active"
                  : alert.status === "Dispatched"
                  ? "police-sos-item-dispatched"
                  : "police-sos-item-responded"
              }`}
              onClick={() => setSelectedAlert(alert)}
            >
              <div className="police-sos-item-content">
                <div className="police-sos-item-header">
                  <span
                    className={`police-sos-indicator ${
                      alert.status === "Active" ? "police-sos-pulse" : ""
                    }`}
                  >
                    {alert.status === "Active"
                      ? "🔴"
                      : alert.status === "Dispatched"
                      ? "🟡"
                      : "🟢"}
                  </span>
                  <span className="police-sos-id">{alert.id || alert.docId}</span>
                  <span
                    className={`police-sos-badge ${
                      alert.status === "Active"
                        ? "police-sos-badge-active"
                        : alert.status === "Dispatched"
                        ? "police-sos-badge-dispatched"
                        : "police-sos-badge-responded"
                    }`}
                  >
                    {alert.status}
                  </span>
                </div>
                <div className="police-sos-item-details">
                  <span>📍 {alert.location}</span>
                  <span>{alert.time}</span>
                </div>
              </div>
              <div className="police-sos-item-actions">
                {alert.status === "Active" && (
                  <button
                    className="police-respond-btn"
                    onClick={(e) => handleRespond(alert, e)}
                    disabled={respondingId === alert.docId}
                  >
                    {respondingId === alert.docId ? "Responding..." : "Respond"}
                  </button>
                )}
                {alert.status === "Dispatched" && (
                  <button
                    className="police-resolve-btn"
                    onClick={(e) => handleRespond(alert, e)}
                    disabled={respondingId === alert.docId}
                  >
                    {respondingId === alert.docId ? "Resolving..." : "Resolve"}
                  </button>
                )}
                <button className="police-call-btn" title="Call user">
                  📞
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="police-modal-overlay" onClick={() => setSelectedAlert(null)}>
          <div
            className="police-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="police-modal-close"
              onClick={() => setSelectedAlert(null)}
            >
              ✕
            </button>

            <div className="police-modal-header">
              <h2>⚠️ {selectedAlert.id || selectedAlert.docId}</h2>
            </div>

            <div className="police-modal-body">
              <span
                className={`police-badge ${
                  selectedAlert.status === "Active"
                    ? "police-badge-danger"
                    : selectedAlert.status === "Dispatched"
                    ? "police-badge-warning"
                    : "police-badge-success"
                }`}
              >
                {selectedAlert.status}
              </span>

              <div className="police-modal-section">
                <label>Location</label>
                <p>📍 {selectedAlert.location}</p>
              </div>

              <div className="police-modal-section">
                <label>Time</label>
                <p>{selectedAlert.time}</p>
              </div>

              <div className="police-modal-section">
                <label>Contact</label>
                <p>📞 {selectedAlert.userPhone}</p>
              </div>

              <div className="police-modal-section">
                <label>Live Location</label>
                <div className="police-location-map">
                  <div className="police-location-pulse"></div>
                </div>
              </div>

              <div className="police-modal-actions">
                <button className="police-action-btn police-action-primary">
                  📞 Contact
                </button>
                {selectedAlert.status === "Active" && (
                  <button
                    className="police-action-btn police-action-danger"
                    onClick={(e) => handleDispatch(selectedAlert, e)}
                    disabled={dispatchingId === selectedAlert.docId}
                  >
                    {dispatchingId === selectedAlert.docId
                      ? "📡 Dispatching..."
                      : "📡 Dispatch"}
                  </button>
                )}
                {selectedAlert.status === "Dispatched" && (
                  <button
                    className="police-action-btn police-action-success"
                    onClick={(e) => handleRespond(selectedAlert, e)}
                    disabled={respondingId === selectedAlert.docId}
                  >
                    {respondingId === selectedAlert.docId
                      ? "Resolving..."
                      : "✓ Resolve"}
                  </button>
                )}
                {selectedAlert.status === "Responded" && (
                  <button className="police-action-btn police-action-resolved">
                    ✓ Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
