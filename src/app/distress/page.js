"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/firebase/firebase";
import { collection, addDoc, Timestamp, doc, getDoc } from "firebase/firestore";

export default function DistressPage() {
  const router = useRouter();
  const [isActivating, setIsActivating] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const countdownRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");

  // Get user data and geolocation
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      // Get user data from Firestore
      const userRef = doc(firestore, "users", user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        setUserName(data.fullName || "User");
        setUserPhone(data.phone || user.phoneNumber || "");
      }
    });

    // Get geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError("");
        },
        (error) => {
          setLocationError("Unable to access location. Please enable location services.");
          console.error("Geolocation error:", error);
        }
      );
    } else {
      setLocationError("Geolocation not supported on this device.");
    }

    return () => unsub();
  }, [router]);

  // Handle panic button click
  const handlePanicButton = async () => {
    if (isActivating) return;

    // Check location first
    if (!userLocation) {
      alert("Location not available. Please enable location services and refresh the page.");
      return;
    }

    setIsActivating(true);
    setCountdown(5);

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          // Call send function outside of setState to ensure it has access to updated state
          setTimeout(() => {
            sendDistressSignal();
          }, 100);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle cancel button
  const handleCancel = () => {
    setIsActivating(false);
    setCountdown(null);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
  };

  // Send distress signal to Firestore
  const sendDistressSignal = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("[Distress] ❌ No user logged in");
        alert("Please log in to send a distress signal.");
        setIsActivating(false);
        setCountdown(null);
        return;
      }

      console.log("[Distress] ✓ User logged in:", user.uid);

      // Get current location if not already fetched
      if (!userLocation) {
        console.error("[Distress] ❌ No location available");
        setLocationError("Location not available. Please enable location services.");
        setIsActivating(false);
        setCountdown(null);
        return;
      }

      console.log("[Distress] ✓ Location obtained:", userLocation);

      // Get reverse geocoding to get location name (using a simple fallback)
      let locationName = "Current Location";
      if (userLocation) {
        locationName = `Lat: ${userLocation.latitude.toFixed(4)}, Lng: ${userLocation.longitude.toFixed(4)}`;
      }

      // Prepare distress signal data
      const distressData = {
        userId: user.uid,
        userName: userName || "User",
        userPhone: userPhone || user.phoneNumber || "N/A",
        userEmail: user.email || "N/A",
        timestamp: Timestamp.now(),
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        location: locationName,
        policeStatus: "Active",
        description: "User sent distress signal",
      };

      console.log("[Distress] 📝 Distress signal data:", distressData);

      // Create distress signal document
      const distressRef = collection(firestore, "distressSignals");
      const docRef = await addDoc(distressRef, distressData);

      console.log("[Distress] ✅ Distress signal created successfully with ID:", docRef.id);
      console.log("[Distress] 📍 Check Firestore: /distressSignals/" + docRef.id);

      // Show success message
      alert(`✓ Distress signal sent!\nAlert ID: ${docRef.id}\nPolice have been notified of your location.`);

      // Reset and redirect
      setIsActivating(false);
      setCountdown(null);
      setTimeout(() => {
        router.push("/home");
      }, 2000);
    } catch (error) {
      console.error("[Distress] ❌ Error sending distress signal:", error);
      console.error("[Distress] Error code:", error.code);
      console.error("[Distress] Error message:", error.message);
      
      let errorMsg = "Failed to send distress signal. Please try again.";
      if (error.code === "permission-denied") {
        errorMsg = "Permission denied. Please check Firestore security rules.";
      } else if (error.code === "unauthenticated") {
        errorMsg = "Not authenticated. Please log in again.";
      }
      
      alert(errorMsg);
      setIsActivating(false);
      setCountdown(null);
    }
  };

  return (
    <div className="distress-page">
      <div className="distress-card">
        <h1>🚨 Emergency Distress Signal</h1>
        <p>Press the panic button to send an emergency alert to police</p>

        {locationError && (
          <div style={{ color: "#ffcccc", marginBottom: "20px", fontSize: "14px" }}>
            ⚠️ {locationError}
          </div>
        )}

        {userLocation && (
          <div style={{ color: "#ccffcc", marginBottom: "20px", fontSize: "12px" }}>
            ✓ Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </div>
        )}

        {!isActivating ? (
          <button className="panic-button" onClick={handlePanicButton} title="Press to send distress signal">
            🆘
          </button>
        ) : (
          <>
            <button className="panic-button" style={{ opacity: 0.5, cursor: "not-allowed" }}>
              🆘
            </button>
            {countdown !== null && (
              <div className="countdown">
                Sending in {countdown}s... (Click Cancel to abort)
              </div>
            )}
          </>
        )}

        {isActivating && (
          <button className="cancel-button" onClick={handleCancel}>
            Cancel
          </button>
        )}

        <p style={{ marginTop: "30px", fontSize: "14px", opacity: 0.8 }}>
          Your location will be shared with the nearest police station.
          <br />
          Response time: 2-5 minutes
        </p>
      </div>
    </div>
  );
}
