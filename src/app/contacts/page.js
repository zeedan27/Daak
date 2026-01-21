"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "@/firebase/firebase";

export default function ContactsPage() {
  const router = useRouter();

  const [uid, setUid] = useState(null);
  const [contacts, setContacts] = useState(["", "", ""]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setUid(user.uid);

      const snap = await getDoc(doc(firestore, "users", user.uid));
      const saved = snap.data()?.emergencyContacts || ["", "", ""];

      const filled = [...saved];
      while (filled.length < 3) filled.push("");

      setContacts(filled);
    });

    return () => unsub();
  }, [router]);

  const updateContact = async (index) => {
    const email = contacts[index].trim();
    if (!email) {
      setStatus("Please enter a valid email.");
      return;
    }

    await saveContacts();
  };

  const removeContact = async (index) => {
    const updated = [...contacts];
    updated[index] = "";
    setContacts(updated);
    await saveContacts(updated);
  };

  const saveContacts = async (override) => {
    try {
      await updateDoc(doc(firestore, "users", uid), {
        emergencyContacts: override || contacts,
      });
      setStatus("Contacts updated.");
    } catch (err) {
      setStatus(err.message);
    }
  };

  return (
    <div className="contacts-page">
      <div className="contacts-card">
        <h2>Emergency Contacts</h2>

        <div className="contacts-container">
          {contacts.map((email, i) => (
            <div className="contact-row" key={i}>
              <input
                type="email"
                value={email}
                placeholder="Enter contact email"
                onChange={(e) => {
                  const updated = [...contacts];
                  updated[i] = e.target.value;
                  setContacts(updated);
                }}
              />
              <button onClick={() => updateContact(i)}>Update</button>
              <button
                className="danger"
                onClick={() => removeContact(i)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <p className="status">{status}</p>
      </div>

      <footer className="contacts-footer">
        Made with ❤️ by Team Featherflow
      </footer>
    </div>
  );
}
