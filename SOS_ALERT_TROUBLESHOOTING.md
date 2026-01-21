# SOS Alert Troubleshooting Guide

## Problem: No SOS Alerts Showing on Police End After User Sends Distress Signal

---

## Step 1: Check if Distress Signal Was Actually Created

1. **Log in as a regular user**
2. Go to `/distress` page
3. Click the **Panic Button** 
4. Wait for the 5-second countdown
5. **Check browser console** (F12 → Console):
   - Should see: `[Distress] ✅ Distress signal created successfully with ID: xyz123`
   - Should see: `[Distress] 📍 Check Firestore: /distressSignals/xyz123`

**If you see these messages**, proceed to Step 2.

**If you see error**, check:
- `[Distress] ❌ No user logged in` → Log in first
- `[Distress] ❌ No location available` → Enable location services on your device
- `[Distress] ❌ permission-denied` → Firestore security rules issue (see Step 4)

---

## Step 2: Verify Distress Signal Was Saved to Firestore

1. **Firebase Console** → **Firestore Database** → **Collections**
2. Click on `distressSignals`
3. **Should see** new documents created recently

If documents exist, they have these fields:
```json
{
  "userId": "user123",
  "userName": "User Name",
  "userPhone": "123-456-7890",
  "timestamp": "2026-01-21T...",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "location": "Lat: 37.7749, Lng: -122.4194",
  "policeStatus": "Active",
  "description": "User sent distress signal"
}
```

**If no documents appear**, the write failed. Check:
- Step 1 console for errors
- Firebase security rules allow `distressSignals` writes (see Step 4)

---

## Step 3: Check Police End is Reading Alerts

1. **Log in as police user**
2. Go to `/police/sos` page (SOS Monitor)
3. **Check browser console** for:
   - `[SOS Monitor] ✓ Fetched X distress signals from Firestore`
   - List of alerts with their docId, status, and location

If you see `Fetched 0 distress signals`, but distress signals exist in Firestore:
- Go to Step 4 (security rules issue)

If you see `Fetched N distress signals` but they don't appear on page:
- They might not have `policeStatus: "Active"` field
- Check the exact field names in Firestore

---

## Step 4: Verify Firestore Security Rules

Your current rules must allow:
1. **Users to CREATE distressSignals**
2. **Police to READ distressSignals**

Check rules in **Firebase Console → Firestore → Rules**:

```javascript
match /distressSignals/{signalId} {
  allow create: if request.auth != null;
  allow read: if request.auth != null;
  allow update: if isPolice() || isAdmin();
  allow delete: if isAdmin();
}

function isPolice() {
  return request.auth != null && 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "police";
}
```

**If different**, update to match above and **Publish**.

---

## Step 5: Verify Police User has "police" Role

1. **Firebase Console** → **Firestore** → **Collections** → `users`
2. Find the police user document
3. **Check** that it has field:
   - **Field name**: `role`
   - **Value**: `police` (string, lowercase)

If missing or wrong:
- Edit the document
- Add/update `role` field to `"police"`
- Save

---

## Step 6: Test the Full Flow

### For Regular User:
1. Log out completely
2. Log in as regular user
3. Go to `/distress`
4. Open console (F12)
5. Click Panic Button
6. Check for `[Distress] ✅ Distress signal created successfully`
7. Note the Alert ID shown in alert box

### For Police User:
1. Log out completely
2. Log in as police user
3. Open console (F12) **BEFORE navigating**
4. Go to `/police/sos`
5. Check console for `[SOS Monitor] ✓ Fetched X distress signals`
6. Should show the alert ID from previous step
7. Alert should appear on page

---

## Debugging Checklist

- [ ] User location services are enabled
- [ ] Distress signal appears in Firestore `distressSignals` collection
- [ ] Police user has `role: "police"` in Firestore `users` collection
- [ ] Firestore security rules allow `distressSignals` read/write
- [ ] Console shows no `permission-denied` errors
- [ ] Police page shows alerts after refresh (F5)
- [ ] Browser cache cleared (Ctrl+Shift+R)

---

## Common Issues & Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| "Location not available" on distress page | Location services disabled | Enable location in browser/device settings |
| `[Distress] ❌ permission-denied` | Rules don't allow distress signal creation | Update Firestore rules (Step 4) |
| Police sees 0 alerts | Rules don't allow police to read distressSignals | Update Firestore rules (Step 4) |
| Distress signal created but police doesn't see it | Police role not set correctly | Check police user has `role: "police"` (Step 5) |
| Browser cache | Updated rules but still seeing errors | Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac) |

---

## Console Output Examples

### Success - User Side:
```
[Distress] ✓ User logged in: abc123def456
[Distress] ✓ Location obtained: {latitude: 37.7749, longitude: -122.4194}
[Distress] 📝 Distress signal data: {...}
[Distress] ✅ Distress signal created successfully with ID: xyz789
[Distress] 📍 Check Firestore: /distressSignals/xyz789
```

### Success - Police Side:
```
[SOS Monitor] ✓ Fetched 3 distress signals from Firestore
[SOS Monitor] Alerts in collection: 3
  [0] xyz789 - Status: Active - Location: Lat: 37.7749, Lng: -122.4194
  [1] abc456 - Status: Active - Location: Lat: 37.8044, Lng: -122.2712
  [2] def123 - Status: Dispatched - Location: Lat: 37.6879, Lng: -122.4702
```

---

## Still Not Working?

Follow these steps:
1. **Check console** for exact error messages
2. **Screenshot the error** and the Firestore collection
3. **Verify**:
   - User document exists with correct `role`
   - Police document exists with correct `role`
   - Distress signals collection has data
   - Security rules are published

