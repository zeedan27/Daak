"use client";

import { useEffect } from "react";
import { firestore, auth } from "@/firebase/firebase";
import { getDoc, doc, collection, getDocs, updateDoc } from "firebase/firestore";

export default function DiagnosticPanel() {
  useEffect(() => {
    const diagnose = async () => {
      console.log("\n=== FIRESTORE DIAGNOSTIC ===\n");

      // 1. Check auth
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("❌ NOT LOGGED IN");
        return;
      }
      console.log("✅ Auth User UID:", currentUser.uid);
      console.log("✅ Auth User Email:", currentUser.email);

      // 2. Check user document
      try {
        const userRef = doc(firestore, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.error("❌ User document does NOT exist in Firestore!");
          console.error("   Expected at: /users/" + currentUser.uid);
          return;
        }

        const userData = userSnap.data();
        console.log("✅ User document found");
        console.log("   Data:", userData);

        const role = userData.role;
        console.log("   Role field:", role);

        if (role === "police") {
          console.log("✅ Role is correctly set to 'police'");
        } else {
          console.error("❌ Role is '" + role + "', expected 'police'");
        }
      } catch (error) {
        console.error("❌ Error reading user document:", error);
      }

      // 3. Test update permission
      console.log("\n--- Testing update permission ---");
      try {
        const testReportRef = doc(firestore, "reports", "TEST_REPORT_ID");
        console.log("Attempting to update:", testReportRef.path);
        
        // This will fail if report doesn't exist, but will test permissions
        await updateDoc(testReportRef, { status: "test" });
        console.log("✅ Update succeeded!");
      } catch (error) {
        if (error.code === "permission-denied") {
          console.error("❌ PERMISSION DENIED - Check:");
          console.error("   1. Is role set to 'police' in users doc?");
          console.error("   2. Did you Publish the Firestore rules?");
          console.error("   3. Is Auth UID same as Firestore doc ID?");
        } else if (error.code === "not-found") {
          console.log("✅ Permission OK (document not found, which is expected)");
        } else {
          console.error("❌ Error:", error.code, error.message);
        }
      }

      // 4. List all reports
      console.log("\n--- Checking reports collection ---");
      try {
        const reportsRef = collection(firestore, "reports");
        const querySnap = await getDocs(reportsRef);
        console.log("✅ Can read reports:", querySnap.size, "reports found");
      } catch (error) {
        console.error("❌ Cannot read reports:", error.message);
      }

      console.log("\n=== END DIAGNOSTIC ===\n");
    };

    // Run after a short delay to ensure auth is ready
    const timer = setTimeout(diagnose, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      padding: "20px",
      backgroundColor: "#f0f0f0",
      borderRadius: "8px",
      fontFamily: "monospace",
      fontSize: "12px",
      whiteSpace: "pre-wrap",
      wordBreak: "break-all"
    }}>
      <h3>🔍 Firestore Diagnostic Panel</h3>
      <p>Check browser console (F12 → Console) for diagnostic results</p>
      <p style={{ color: "#666" }}>Diagnosis will run automatically in 1 second...</p>
    </div>
  );
}
