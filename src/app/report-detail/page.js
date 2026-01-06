"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { auth, firestore } from "@/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  runTransaction
} from "firebase/firestore";

export default function ReportDetailPage() {
  // ✅ Works for both patterns:
  // - /report-detail?id=123  (query param)
  // - /report/[id]          (dynamic route)
  const params = useSearchParams();
  const routeParams = useParams();
  const reportId = routeParams?.id || params.get("id");

  const [report, setReport] = useState(null);
  const [tips, setTips] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [tipText, setTipText] = useState("");

  const mapDivRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u || null));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!reportId) return;

    const load = async () => {
      const snap = await getDoc(doc(firestore, "reports", reportId));
      if (!snap.exists()) return;
      setReport(snap.data());
    };

    load();
  }, [reportId]);

  useEffect(() => {
    if (!reportId) return;

    const loadTips = async () => {
      const q = query(
        collection(firestore, "reports", reportId, "tips"),
        orderBy("timestamp", "desc")
      );
      const snap = await getDocs(q);
      setTips(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    loadTips();
  }, [reportId]);

  // ✅ Leaflet: dynamic import (client-only)
  useEffect(() => {
    const renderMap = async () => {
      if (!report?.latitude || !report?.longitude) return;
      if (!mapDivRef.current) return;

      // remove any old map instance (StrictMode safe)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const L = (await import("leaflet")).default;

      // ensure leaflet CSS is loaded client-side (optional but safe)
      await import("leaflet/dist/leaflet.css");

      const map = L.map(mapDivRef.current).setView(
        [report.latitude, report.longitude],
        16
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
      }).addTo(map);

      L.marker([report.latitude, report.longitude]).addTo(map);

      mapInstanceRef.current = map;
    };

    renderMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [report]);

  const submitTip = async () => {
    const text = tipText.trim();
    if (!text || !currentUser || !reportId) return;

    await addDoc(collection(firestore, "reports", reportId, "tips"), {
      text,
      user: currentUser.email || "Anonymous",
      timestamp: new Date(),
      votes: 0,
      votedBy: { [currentUser.uid]: 0 }
    });

    setTipText("");

    // reload tips
    const q = query(
      collection(firestore, "reports", reportId, "tips"),
      orderBy("timestamp", "desc")
    );
    const snap = await getDocs(q);
    setTips(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const voteTip = async (tipId, direction) => {
    if (!currentUser || !reportId) return;

    const tipRef = doc(firestore, "reports", reportId, "tips", tipId);

    await runTransaction(firestore, async (tx) => {
      const snap = await tx.get(tipRef);
      if (!snap.exists()) return;

      const data = snap.data();
      const votedBy = data.votedBy || {};
      const prev = votedBy[currentUser.uid] || 0;

      if (prev === direction) return;

      const newVotes = (data.votes || 0) + direction - prev;
      votedBy[currentUser.uid] = direction;

      tx.update(tipRef, { votes: newVotes, votedBy });
    });

    // reload tips
    const q = query(
      collection(firestore, "reports", reportId, "tips"),
      orderBy("timestamp", "desc")
    );
    const snap = await getDocs(q);
    setTips(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  if (!report) {
    return <div className="report-detail-page">Loading...</div>;
  }

  const statusLower = (report.status || "pending").toLowerCase();

  return (
    <div className="report-detail-page">
      <div className="container">
        <h2>{report.crimeType || "Report"}</h2>
        <span className={`tag ${statusLower}`}>{report.status || "Pending"}</span>

        <p className="meta">
          <strong>Date & Time:</strong>{" "}
          {report.timestamp?.seconds
            ? new Date(report.timestamp.seconds * 1000).toLocaleString()
            : ""}
        </p>

        <p className="meta">
          <strong>Location:</strong>{" "}
          {(report.streetAddress || "Unknown") + (report.region ? `, ${report.region}` : "")}
        </p>

        <p className="meta">
          <strong>Reported by:</strong>{" "}
          {report.isAnonymous ? "Anonymous" : report.reporterName || "User"}
        </p>

        {report.latitude && report.longitude ? (
          <div ref={mapDivRef} id="map" />
        ) : null}

        <h3>Description</h3>
        <p>{report.description || ""}</p>

        <div className="tips">
          <h3>Community Tips</h3>

          <div className="tips-list">
            {tips.map((tip) => {
              const upVoted = tip.votedBy?.[currentUser?.uid] === 1;
              const downVoted = tip.votedBy?.[currentUser?.uid] === -1;

              return (
                <div className="tip" key={tip.id}>
                  <p>{tip.text}</p>
                  <p className="tip-meta">
                    By {tip.user || "Anonymous"} •{" "}
                    <span
                      className="vote"
                      onClick={() => voteTip(tip.id, 1)}
                      style={{ color: upVoted ? "green" : "#555" }}
                    >
                      ▲
                    </span>
                    <span
                      className="vote"
                      onClick={() => voteTip(tip.id, -1)}
                      style={{ color: downVoted ? "red" : "#555" }}
                    >
                      ▼
                    </span>
                    Votes: {tip.votes || 0}
                  </p>
                </div>
              );
            })}
          </div>

          <textarea
            value={tipText}
            onChange={(e) => setTipText(e.target.value)}
            placeholder="Submit a helpful tip..."
            rows={3}
            className="tip-input"
          />

          <button onClick={submitTip} className="tip-submit">
            Submit Tip
          </button>
        </div>
      </div>
    </div>
  );
}
