export async function uploadToCloudinary(file) {
  const url = "https://api.cloudinary.com/v1_1/dvexnxlb0/auto/upload";
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "daak_unsigned");

  const res = await fetch(url, { method: "POST", body: formData });
  const data = await res.json();
  if (!data.secure_url) throw new Error("Upload failed");
  return data.secure_url;
}