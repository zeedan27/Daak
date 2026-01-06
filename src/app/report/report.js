import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, firestore } from "@/firebase/firebase";

export async function uploadToCloudinary(file) {
  const url = "https://api.cloudinary.com/v1_1/dvexnxlb0/auto/upload";
  const preset = "daak_unsigned";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", preset);

  const response = await fetch(url, { method: "POST", body: formData });
  const data = await response.json();

  if (!data.secure_url) throw new Error("Upload failed");
  return data.secure_url;
}

async function getReporterName(user, isAnonymous) {
  if (isAnonymous) return "Anonymous";

  try {
    const snap = await getDoc(doc(firestore, "users", user.uid));
    if (snap.exists()) {
      const d = snap.data();
      if (d?.fullName) return d.fullName;
      if (d?.name) return d.name;
    }
  } catch (e) {}
  return "User";
}

async function getReverseGeocode(lat, lng) {
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}` +
    `&zoom=18&addressdetails=1`;

  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const data = await response.json();

  return {
    streetAddress: data?.display_name || null,
    region:
      data?.address?.suburb ||
      data?.address?.neighbourhood ||
      data?.address?.city_district ||
      data?.address?.city ||
      null,
    area: data?.address?.road || null,
  };
}

export function setupReportForm({ setMapLocation }) {
  const unsub = onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const form = document.getElementById("reportForm");
    if (!form) return;

    const locateBtn = document.getElementById("locateMeBtn");
    if (locateBtn) {
      locateBtn.addEventListener("click", () => {
        if (!navigator.geolocation) {
          alert("Geolocation not supported.");
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;

            const latEl = document.getElementById("latitude");
            const lngEl = document.getElementById("longitude");
            if (latEl) latEl.value = String(latitude);
            if (lngEl) lngEl.value = String(longitude);

            if (typeof setMapLocation === "function") {
              setMapLocation(latitude, longitude);
            }
          },
          () => {
            const latEl = document.getElementById("latitude");
            if (!latEl?.value) alert("Unable to retrieve your location.");
          }
        );
      });
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      try {
        const crimeType = document.getElementById("crimeType")?.value || "";
        const description = document.getElementById("description")?.value || "";
        const isAnonymous = !!document.getElementById("anonymousCheckbox")?.checked;

        const latitudeStr = document.getElementById("latitude")?.value || "";
        const longitudeStr = document.getElementById("longitude")?.value || "";

        const latitude = latitudeStr ? parseFloat(latitudeStr) : null;
        const longitude = longitudeStr ? parseFloat(longitudeStr) : null;

        const mediaInput = document.getElementById("media");
        const mediaFiles = mediaInput?.files ? Array.from(mediaInput.files) : [];

        const gdInput = document.getElementById("gdFile");
        const gdFile = gdInput?.files?.[0] || null;

        let streetAddress = null;
        let region = null;
        let area = null;

        if (latitude !== null && longitude !== null) {
          try {
            const loc = await getReverseGeocode(latitude, longitude);
            streetAddress = loc.streetAddress;
            region = loc.region;
            area = loc.area;
          } catch (err) {
            console.warn("Reverse geocoding failed:", err);
          }
        }

        let mediaUrls = [];
        let gdUrl = null;
        let gdType = null;

        try {
          for (const f of mediaFiles) {
            mediaUrls.push(await uploadToCloudinary(f));
          }

          if (gdFile) {
            gdUrl = await uploadToCloudinary(gdFile);
            if (gdFile.type.startsWith("image/")) gdType = "image";
            else if (gdFile.type === "application/pdf" || gdFile.name?.endsWith(".pdf")) gdType = "pdf";
          }
        } catch (err) {
          console.error("Upload failed:", err);
          alert("Failed to upload one or more files.");
          return;
        }

        const reporterName = await getReporterName(user, isAnonymous);

        const reportData = {
          crimeType,
          description,
          userId: user.uid,
          reporterName,
          isAnonymous,
          timestamp: serverTimestamp(),
          latitude,
          longitude,
          streetAddress,
          region,
          area,
          mediaUrls,
          gdUrl,
          gdType,
          suspects: [],
          victims: [],
        };

        await addDoc(collection(firestore, "reports"), reportData);

        alert("Report submitted successfully!");
        form.reset();
      } catch (error) {
        console.error("Error submitting report:", error);
        alert("Failed to submit report. Please try again.");
      }
    });
  });

  return () => unsub();
}
