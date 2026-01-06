"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";

export default function HeatmapPage() {
  const mapRef = useRef(null);

  useEffect(() => {
    let heatLayer = null;
    let markersLayer = null;
    let allPoints = [];
    let cancelled = false;

    const waitForNonZeroMapSize = async (map, tries = 20) => {
      // Wait up to ~1s total (20 * 50ms) for layout to settle
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
      // Prevent double init (React Strict Mode / Fast Refresh)
      if (mapRef.current) return;

      const leafletMod = await import("leaflet");
      const L = leafletMod.default || leafletMod;

      await import("leaflet.heat");
      await import("leaflet-control-geocoder");

      const container = L.DomUtil.get("map");
      if (!container) return;

      // If Leaflet already stamped this container, reset it
      if (container._leaflet_id) {
        container._leaflet_id = null;
      }

      const map = L.map(container).setView([23.8103, 90.4125], 12);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      markersLayer = L.layerGroup().addTo(map);
      // --- Geocoder: bias/restrict results to Bangladesh ---
    const bdGeocoder = L.Control.Geocoder.nominatim({
        geocodingQueryParams: {
            countrycodes: "bd",                 // restrict to Bangladesh
            "accept-language": "en",            // results language
            viewbox: "88.0,26.0,92.8,20.5",     // Bangladesh-ish bounding box (lon1,lat1,lon2,lat2)
            bounded: 1,                         // prefer results inside the viewbox
        },
    });

    L.Control.geocoder({
        geocoder: bdGeocoder,
        defaultMarkGeocode: false,
        placeholder: "Search in Bangladesh (e.g., Mohammadpur, Dhaka)",
        })
        .on("markgeocode", (e) => {
            const c = e.geocode.center;
            L.marker(c).addTo(map);
            map.setView(c, 15);
    })
    .addTo(map);



      // Make sure size is computed before any canvas work
      await waitForNonZeroMapSize(map);

      const locateBtn = document.getElementById("locateMeBtn");
      const crimeFilter = document.getElementById("crimeFilter");
      const timeFilter = document.getElementById("timeFilter");

      const renderHeatmap = async (points) => {
        const m = mapRef.current;
        if (!m) return;

        // If layout is not ready yet, wait again
        const ok = await waitForNonZeroMapSize(m);
        if (!ok || cancelled || !mapRef.current) return;

        if (heatLayer) m.removeLayer(heatLayer);
        heatLayer = L.heatLayer(points, { radius: 25 }).addTo(m);
      };

      const renderMarkers = (reports) => {
        if (!markersLayer) return;
        markersLayer.clearLayers();

        reports.forEach((r) => {
          const marker = L.circleMarker([r.lat, r.lng], {
            radius: 25,
            color: "transparent",
            fillColor: "transparent",
            fillOpacity: 0,
            weight: 0,
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
        const type = crimeFilter?.value || "all";
        const time = timeFilter?.value || "all";
        const now = new Date();

        const filtered = allPoints.filter((p) => {
          if (type !== "all" && p.crimeType !== type) return false;

          if (time === "today") {
            return new Date(p.timestamp).toDateString() === now.toDateString();
          }

          if (!isNaN(time)) {
            const past = new Date();
            past.setDate(now.getDate() - parseInt(time));
            return p.timestamp >= past;
          }

          return true;
        });

        // Heat expects an array; empty is fine, but we still must have a non-zero canvas
        const heatPoints = filtered.map((p) => [p.lat, p.lng, 1]);
        await renderHeatmap(heatPoints);
        renderMarkers(filtered);
      };

      let userLocationMarker = null;
let userAccuracyCircle = null;

if (locateBtn) {
  locateBtn.onclick = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const m = mapRef.current;
        if (!m) return;

        // remove previous location marker
        if (userLocationMarker) m.removeLayer(userLocationMarker);
        if (userAccuracyCircle) m.removeLayer(userAccuracyCircle);

        // visible marker (no image icon needed)
        userLocationMarker = L.circleMarker([latitude, longitude], {
          radius: 8,
          weight: 2,
          opacity: 1,
          fillOpacity: 0.6,
        }).addTo(m);

        // optional accuracy circle
        userAccuracyCircle = L.circle([latitude, longitude], {
          radius: Math.max(accuracy || 0, 30),
          weight: 1,
          opacity: 0.4,
          fillOpacity: 0.08,
        }).addTo(m);

        m.setView([latitude, longitude], 15);
        userLocationMarker.bindPopup("You are here").openPopup();
      },
      () => {
        alert("Could not access your location. Please allow location permission.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };
}


      // On resize, re-calc and re-render heat to avoid 0-height transient states
      map.on("resize", () => {
        if (!mapRef.current) return;
        mapRef.current.invalidateSize();
      });

      // Firestore (modular)
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
            timestamp: d.timestamp.toDate(),
            crimeType: d.crimeType || "Unknown",
            region: d.region || "",
          };
        })
        .filter(Boolean);

      await updateHeatmap();

      if (crimeFilter) crimeFilter.onchange = updateHeatmap;
      if (timeFilter) timeFilter.onchange = updateHeatmap;
    };

    loadLeaflet();

    return () => {
      cancelled = true;

      // Remove DOM handlers
      const locateBtn = document.getElementById("locateMeBtn");
      const crimeFilter = document.getElementById("crimeFilter");
      const timeFilter = document.getElementById("timeFilter");

      if (locateBtn) locateBtn.onclick = null;
      if (crimeFilter) crimeFilter.onchange = null;
      if (timeFilter) timeFilter.onchange = null;

      // Destroy map safely
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="heatmap-page">
      <div className="heatmap-controls">
        <label htmlFor="crimeFilter">Crime:</label>
        <select id="crimeFilter" name="crimeFilter">
          <option value="all">All Crimes</option>
          <option value="Robbery">Robbery</option>
          <option value="Theft">Theft</option>
          <option value="Assault">Assault</option>
          <option value="Harassment">Harassment</option>
          <option value="Murder">Murder</option>
          <option value="Pickpocketing">Pickpocketing</option>
        </select>

        <label htmlFor="timeFilter">Time:</label>
        <select id="timeFilter" name="timeFilter">
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
        </select>

        <button id="locateMeBtn" type="button">📍 Locate Me</button>
      </div>

      <div id="map" className="heatmap-map" />
    </div>
  );
}