"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/firebase/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Loading...");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const userRef = doc(firestore, "users", user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        setUserName(data.fullName || "User");
        setIsAdmin(data.role === "admin");
      } else {
        setUserName("User");
      }
    });

    return () => unsub();
  }, [router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const close = () => setShowDropdown(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const logoutUser = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const goAdmin = () => {
    if (isAdmin) router.push("/admin");
    else alert("Access denied. You are not an admin.");
  };

  return (
    <div className="home-page" onClick={() => setShowDropdown(false)}>
      <div className="card" onClick={(e) => e.stopPropagation()}>
        <img src="/assets/images/logo.png" alt="Daak Logo" className="logo" />
        <h1>ডাক</h1>
        <h3 className="welcome">Welcome, {userName}</h3>

        <div className="home-buttons">
          <div
            className="btn"
            id="crimeDbBtn"
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown((v) => !v);
            }}
          >
            Crime Database ▼
            {showDropdown && (
              <div className="dropdown" id="crimeDbMenu">
                <Link href="/public-reports">Public Reports</Link>
                <Link href="/criminal-database">Criminal Database</Link>
              </div>
            )}
          </div>

          <Link href="/report" className="btn">Report Crime</Link>
          <Link href="/contacts" className="btn">Emergency Contacts</Link>
          <Link href="/distress" className="btn">Distress Signal</Link>
          <Link href="/chatbot" className="btn">Chatbot</Link>
          <Link href="/heatmap" className="btn">Heatmap</Link>
        </div>

        {isAdmin && (
          <button id="adminBtn" onClick={goAdmin}>
            Admin
          </button>
        )}

        <button className="btn signup logout-btn" onClick={logoutUser}>
          Log Out
        </button>
      </div>

      <footer className="footer">Made with ❤️ by Team Featherflow</footer>
    </div>
  );
}