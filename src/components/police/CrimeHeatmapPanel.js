"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

export default function CrimeHeatmapPanel() {
  const mapRef = useRef(null);
  const [crimeType, setCrimeType] = useState("all");
  const [timeRange, setTimeRange] = useState("7days");
  const [stats, setStats] = useState({ total: 0, highest: null, areas: 0 });

  useEffect(() => {
    let heatLayer = null;
    let markersLayer = null;
    let allPoints = [];
    let cancelled = false;

    const waitForNonZeroMapSize = async (map, tries = 20) => {
      for (let i = 0; i < tries; i++) {
        if (cancelled) return false;
        map.invalidateSize();
        const s = map.getSize();
        if (s && s.x > 0 && s.y > 0) return true;
        await new Promise((r) => setTimeout(r, 50));
      }
      return false;
    };

    const loadLeaflet = async () => {
      if (mapRef.current) return;

      const leafletMod = await import("leaflet");
      const L = leafletMod.default || leafletMod;

      await import("leaflet.heat");

      const container = L.DomUtil.get("police-heatmap");
      if (!container) return;

      if (container._leaflet_id) {
        container._leaflet_id = null;
      }

      const map = L.map(container).setView([23.8103, 90.4125], 12);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      markersLayer = L.layerGroup().addTo(map);

      await waitForNonZeroMapSize(map);

      const crimeFilterSelect = document.getElementById("policeHeatmapCrimeFilter");
      const timeFilterSelect = document.getElementById("policeHeatmapTimeFilter");

      const renderHeatmap = async (points) => {
        const m = mapRef.current;
        if (!m) return;

        const ok = await waitForNonZeroMapSize(m);
        if (!ok || cancelled || !mapRef.current) return;

        if (heatLayer) m.removeLayer(heatLayer);
        heatLayer = L.heatLayer(points, { radius: 25, blur: 15, max: 1 }).addTo(m);
      };

      const renderMarkers = (reports) => {
        if (!markersLayer) return;
        markersLayer.clearLayers();

        reports.forEach((r) => {
          const marker = L.circleMarker([r.lat, r.lng], {
            radius: 8,
            color: "#dc2626",
            fillColor: "#dc2626",
            fillOpacity: 0.7,
            weight: 2,
            opacity: 1,
          });

          marker.bindPopup(`
            <strong>${r.crimeType}</strong><br/>
            ${r.region || "Unknown Area"}<br/>
            ${new Date(r.timestamp).toLocaleString()}
          `);

          markersLayer.addLayer(marker);
        });
      };

      const updateHeatmap = async () => {
        const type = crimeFilterSelect?.value || "all";
        const time = timeFilterSelect?.value || "7days";
        const now = new Date();

        let startDate = new Date();
        if (time === "24hours") {
          startDate.setHours(now.getHours() - 24);
        } else if (time === "7days") {
          startDate.setDate(now.getDate() - 7);
        } else if (time === "30days") {
          startDate.setDate(now.getDate() - 30);
        } else if (time === "90days") {
          startDate.setDate(now.getDate() - 90);
        } else if (time === "year") {
          startDate.setFullYear(now.getFullYear() - 1);
        }

        const filtered = allPoints.filter((p) => {
          if (type !== "all" && p.crimeType !== type) return false;
          return p.timestamp >= startDate;
        });

        // Calculate stats
        const areas = new Set(filtered.map(p => p.region)).size;
        setStats({
          total: filtered.length,
          highest: filtered.length > 0 ? Math.max(...filtered.map(p => 1)) : 0,
          areas: areas
        });

        const heatPoints = filtered.map((p) => [p.lat, p.lng, 1]);
        await renderHeatmap(heatPoints);
        renderMarkers(filtered);
      };

      map.on("resize", () => {
        if (!mapRef.current) return;
        mapRef.current.invalidateSize();
      });

      // Fetch from Firestore
      const { firestore } = await import("@/firebase/firebase");
      const { collection, getDocs } = await import("firebase/firestore");

      const snap = await getDocs(collection(firestore, "reports"));
      if (cancelled) return;

      allPoints = snap.docs
        .map((doc) => {
          const d = doc.data();
          if (!d.latitude || !d.longitude || !d.timestamp) return null;
          return {
            lat: d.latitude,
            lng: d.longitude,
            timestamp: d.timestamp.toDate ? d.timestamp.toDate() : new Date(d.timestamp),
            crimeType: d.crimeType || "Unknown",
            region: d.region || "Unknown",
          };
        })
        .filter(Boolean);

      await updateHeatmap();

      if (crimeFilterSelect) crimeFilterSelect.onchange = updateHeatmap;
      if (timeFilterSelect) timeFilterSelect.onchange = updateHeatmap;
    };

    loadLeaflet();

    return () => {
      cancelled = true;

      const crimeFilterSelect = document.getElementById("policeHeatmapCrimeFilter");
      const timeFilterSelect = document.getElementById("policeHeatmapTimeFilter");

      if (crimeFilterSelect) crimeFilterSelect.onchange = null;
      if (timeFilterSelect) timeFilterSelect.onchange = null;

      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="police-heatmap-panel-full">
      {/* Controls */}
      <div className="police-heatmap-controls">
        <label htmlFor="policeHeatmapCrimeFilter">Crime Type:</label>
        <select
          id="policeHeatmapCrimeFilter"
          defaultValue="all"
          className="police-filter-select"
        >
          <option value="all">All Crimes</option>
          <option value="Robbery">Robbery</option>
          <option value="Theft">Theft</option>
          <option value="Assault">Assault</option>
          <option value="Harassment">Harassment</option>
          <option value="Murder">Murder</option>
          <option value="Pickpocketing">Pickpocketing</option>
        </select>

        <label htmlFor="policeHeatmapTimeFilter">Time Range:</label>
        <select
          id="policeHeatmapTimeFilter"
          defaultValue="7days"
          className="police-filter-select"
        >
          <option value="24hours">Last 24 Hours</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 3 Months</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Map Container */}
      <div id="police-heatmap" className="police-heatmap-map" />
    </div>
  );
}
