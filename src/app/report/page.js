"use client";

import { useEffect, useRef } from "react";
import "@/styles/report.css";

// Leaflet (npm)
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";

import L from "leaflet";
import "leaflet-control-geocoder";

import { setupReportForm } from "./report"; // <-- this matches: src/app/report/report.js

export default function ReportPage() {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // Prevent double init (React Strict Mode)
    if (mapRef.current) return;

    const map = L.map("reportMap").setView([23.8103, 90.4125], 13);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    const setLocation = (lat, lng) => {
      const latEl = document.getElementById("latitude");
      const lngEl = document.getElementById("longitude");
      if (latEl) latEl.value = String(lat);
      if (lngEl) lngEl.value = String(lng);

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }
    };

    // Click to set location
    map.on("click", (e) => {
      setLocation(e.latlng.lat, e.latlng.lng);
    });

    // Bangladesh-only geocoder
    L.Control.geocoder({
      geocoder: L.Control.Geocoder.nominatim({
        geocodingQueryParams: { countrycodes: "bd" },
      }),
      defaultMarkGeocode: false,
    })
      .on("markgeocode", (e) => {
        const { lat, lng } = e.geocode.center;
        map.setView([lat, lng], 16);
        setLocation(lat, lng);
      })
      .addTo(map);

    // Hook up submit + locate logic from report.js
    const cleanupForm = setupReportForm({
      setMapLocation: (lat, lng) => {
        map.setView([lat, lng], 16);
        setLocation(lat, lng);
      },
    });

    // Cleanup
    return () => {
      if (typeof cleanupForm === "function") cleanupForm();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
    };
  }, []);

  return (
    <div className="report-page">
      <div className="report-card">
        <h2>Report a Crime</h2>

        <form id="reportForm">
          <label htmlFor="crimeType">Crime Type</label>
          <select id="crimeType" required>
            <option value="">Select crime type</option>
            <option>Robbery</option>
            <option>Assault</option>
            <option>Harassment</option>
            <option>Vandalism</option>
            <option>Other</option>
          </select>

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            required
            placeholder="Describe what happened..."
          />

          <label>Select Location on Map</label>
          <button type="button" id="locateMeBtn" className="locate-button">
            📍 Use My Location
          </button>

          <div id="reportMap"></div>

          <input type="hidden" id="latitude" />
          <input type="hidden" id="longitude" />

          <label>Upload Image/Video of Incident (optional)</label>
          <input type="file" id="media" accept="image/*,video/*" multiple />

          <label htmlFor="gdFile">Upload GD (image or PDF, optional)</label>
          <input type="file" id="gdFile" accept="image/*,.pdf" />

          <label className="switch-label">
            Report anonymously
            <span className="switch">
              <input type="checkbox" id="anonymousCheckbox" />
              <span className="slider"></span>
            </span>
          </label>

          <button type="submit">Submit Report</button>
        </form>
      </div>
    </div>
  );
}
