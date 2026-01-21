"use client";

import DiagnosticPanel from "@/components/DiagnosticPanel";

export default function DiagnosticPage() {
  return (
    <div style={{
      maxWidth: "800px",
      margin: "40px auto",
      padding: "20px"
    }}>
      <h1>🔍 Firestore Diagnostic</h1>
      <p>This page helps debug Firestore permission issues.</p>
      <p>Open browser console (F12 → Console tab) to see results.</p>
      <hr />
      <DiagnosticPanel />
    </div>
  );
}
