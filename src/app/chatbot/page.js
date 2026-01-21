"use client";

import { useEffect, useRef, useState } from "react";
import { firestore } from "@/firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function ChatbotPage() {
  const [input, setInput] = useState("");

  // IMPORTANT: no Date()/toLocaleTimeString() here (SSR hydration-safe)
  const [messages, setMessages] = useState([
    {
      text: "Hi! I’m your safety assistant. How can I help you today?",
      isBot: true,
      time: "", // fill on client after mount
    },
  ]);

  const [isMounted, setIsMounted] = useState(false);

  const messagesRef = useRef(null);

  const GEMINI_API_KEY = "AIzaSyDqIqkK7JUlKO3e0BqgO5oR-blLNO8Xhs8"; // demo only

  useEffect(() => {
    setIsMounted(true);

    // Fill the initial bot message timestamp only on the client
    setMessages((prev) => {
      if (!prev?.length) return prev;
      if (prev[0].time) return prev;
      const copy = [...prev];
      copy[0] = { ...copy[0], time: new Date().toLocaleTimeString() };
      return copy;
    });
  }, []);

  useEffect(() => {
    messagesRef.current?.scrollTo(0, messagesRef.current.scrollHeight);
  }, [messages]);

  const addMessage = (text, isBot) => {
    // This runs only after hydration (user interaction), so Date() is safe here
    setMessages((prev) => [
      ...prev,
      { text, isBot, time: new Date().toLocaleTimeString() },
    ]);
  };

  const sendToGemini = async (prompt) => {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are DaakAI, a safety assistant for Bangladeshi users.
ONLY respond to safety, emergency, crime, or Daak app usage questions.

User: ${prompt}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No response.";
  };

  const fetchReportsFromFirestore = async (locationKeyword) => {
    const snapshot = await getDocs(collection(firestore, "reports"));
    const matched = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const fields = [data.region, data.area, data.streetAddress];

      if (
        fields.some((f) =>
          f?.toLowerCase().includes(locationKeyword.toLowerCase())
        )
      ) {
        matched.push({
          type: data.crimeType,
          desc: data.description,
          time: data.timestamp?.toDate?.().toLocaleString() || "",
        });
      }
    });

    return matched;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    addMessage(input, false);
    const userText = input;
    setInput("");

    addMessage("DaakAI is typing...", true);

    try {
      const match = userText.match(/\b(in|at)\s+([a-z\s]+)/i);

      if (match) {
        const reports = await fetchReportsFromFirestore(match[2]);
        setMessages((prev) => prev.slice(0, -1)); // remove typing

        if (reports.length) {
          addMessage(
            reports
              .map((r, i) => `${i + 1}. ${r.type} – ${r.desc} (${r.time})`)
              .join("\n\n"),
            true
          );
        } else {
          addMessage("No reports found in that area.", true);
        }
      } else {
        const reply = await sendToGemini(userText);
        setMessages((prev) => prev.slice(0, -1)); // remove typing
        addMessage(reply, true);
      }
    } catch {
      setMessages((prev) => prev.slice(0, -1)); // remove typing
      addMessage("⚠️ Something went wrong. Try again.", true);
    }
  };

  return (
    <div className="chatbot-page">
      <div className="chatbot-container">
        <header className="chatbot-header">
          <h2>🧠 Daak Safety Assistant</h2>
        </header>

        <div className="chatbot-messages" ref={messagesRef}>
          {messages.map((m, i) => (
            <div key={i} className={m.isBot ? "bot-message" : "user-message"}>
              {m.text}

              {/* Show timestamp only after mount (hydration-safe) */}
              {isMounted && m.time ? (
                <div className="timestamp">{m.time}</div>
              ) : null}
            </div>
          ))}
        </div>

        <form className="chatbot-input-area" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Ask something like: What to do in a robbery?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit">➤</button>
        </form>
      </div>
    </div>
  );
}
