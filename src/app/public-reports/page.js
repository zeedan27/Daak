"use client";

import { useEffect, useState, useRef } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { firestore } from "@/firebase/firebase";
import Chart from "chart.js/auto";

export default function PublicReportsPage() {
  const [reports, setReports] = useState([]);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const q = query(collection(firestore, "reports"), orderBy("timestamp", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(data);
      renderChart(data);
    });

    return () => unsub();
  }, []);

  const formatDate = (seconds) => {
    if (!seconds) return "Unknown";
    return new Date(seconds * 1000).toLocaleString();
  };

  const renderChart = (data) => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");

    const counts = {};
    data.forEach(r => {
      if (!r.crimeType) return;
      counts[r.crimeType] = (counts[r.crimeType] || 0) + 1;
    });

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(counts),
        datasets: [{
          label: "Reports",
          data: Object.values(counts),
          backgroundColor: "rgba(255,255,255,0.4)"
        }]
      },
      options: {
        plugins: {
          legend: { labels: { color: "#fff" } }
        },
        scales: {
          x: { ticks: { color: "#fff" } },
          y: { ticks: { color: "#fff" } }
        }
      }
    });
  };

  return (
    <div className="public-reports-page">
      <div className="page-container">
        <header>
          <img src="/assets/images/logo.png" alt="Daak Logo" />
          <h1>ডাক – Public Reports</h1>
        </header>

        <div id="chart-container">
          <canvas ref={chartRef} height="120" />
        </div>

        <div className="reports-list">
          {reports.map(report => (
            <div
              key={report.id}
              className="report-card"
              onClick={() => window.location.href = `/report-detail?id=${report.id}`}
            >
              {report.mediaUrl && (
                <img className="thumb" src={report.mediaUrl} alt="media" />
              )}

              <div className="card-content">
                <span className="tag">{report.crimeType}</span>
                <p><strong>Location:</strong> {report.region || "Unknown"}</p>
                <p><strong>Date:</strong> {formatDate(report.timestamp?.seconds)}</p>
                <p>
                  <strong>Reporter:</strong>{" "}
                  {report.isAnonymous ? "Anonymous" : (report.reporterName || "User")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
