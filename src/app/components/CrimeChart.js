"use client";

import React, { useEffect, useRef } from 'react';

export default function CrimeChart({ reports = [] }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;
    let chartInstance = null;

    (async () => {
      const Chart = (await import('chart.js/auto')).default;
      const ctx = chartRef.current.getContext('2d');

      const now = new Date();
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ label: d.toLocaleString('default', { month: 'short' }), year: d.getFullYear(), month: d.getMonth() });
      }

      const grouped = {};
      reports.forEach(r => {
        const ts = r.timestamp?.seconds ? new Date(r.timestamp.seconds * 1000) : (r.timestamp?.toDate ? r.timestamp.toDate() : null);
        const type = r.crimeType;
        if (!ts || !type) return;
        months.forEach((m, idx) => {
          if (ts.getFullYear() === m.year && ts.getMonth() === m.month) {
            grouped[type] = grouped[type] || new Array(months.length).fill(0);
            grouped[type][idx]++;
          }
        });
      });

      const colorPalette = ['#e74c3c', '#f39c12', '#27ae60', '#2980b9', '#8e44ad', '#16a085'];
      const datasets = Object.entries(grouped).map(([type, data], idx) => ({
        label: type,
        data,
        borderColor: colorPalette[idx % colorPalette.length],
        backgroundColor: colorPalette[idx % colorPalette.length] + '33',
        fill: true,
        tension: 0.3
      }));

      if (chartRef.current._chartInstance) {
        chartRef.current._chartInstance.destroy();
      }

      chartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels: months.map(m => m.label), datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } },
          scales: { x: { ticks: { color: '#fff' } }, y: { ticks: { color: '#fff' } } }
        }
      });

      chartRef.current._chartInstance = chartInstance;
    })();

    return () => {
      if (chartRef.current?._chartInstance) {
        chartRef.current._chartInstance.destroy();
      }
    };
  }, [reports]);

  return (
    <div className="card" role="region" aria-label="Crime trends">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Crime trends</h3>
        <span className="text-sm text-muted">Last 6 months</span>
      </div>
      <div className="chart-container">
        <canvas ref={chartRef} aria-label="Crime trends chart" role="img" />
      </div>
    </div>
  );
}