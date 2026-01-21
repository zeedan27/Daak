# Firestore Security Rules Setup Guide

## Current Issue
Police reports status update is failing with `permission-denied` error. This is because Firestore security rules don't allow police to update the `reports` collection.

---

## Solution: Apply These Security Rules

Go to **Firebase Console → Firestore Database → Rules** and replace the entire ruleset with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // --- Reports ---
    match /reports/{reportId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if isAdmin() || isPolice();
      allow delete: if isAdmin();

      match /tips/{tipId} {
        allow read: if true;
        allow create: if request.auth != null;
        allow update, delete: if isAdmin();
      }
    }

    // --- Distress Signals / SOS Alerts ---
    match /distressSignals/{signalId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
      allow update: if isPolice() || isAdmin();
      allow delete: if isAdmin();
    }

    // --- Users ---
    match /users/{userId} {
      allow read: if request.auth.uid == userId || isAdmin() || isPolice();
      allow write: if request.auth.uid == userId;
      match /chatHistory/{messageId} {
        allow read, write: if request.auth.uid == userId;
      }
    }

    // --- Crime Hotspots / Heatmap Data ---
    match /crimeHotspots/{document=**} {
      allow read: if request.auth != null;
      allow write: if isAdmin() || isPolice();
    }

    // --- Helper Functions ---
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }

    function isPolice() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "police";
    }

    // Deny all other access by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Step-by-Step Instructions

### 1. Go to Firebase Console
- Navigate to https://console.firebase.google.com
- Select your project (e.g., "DAAK")

### 2. Open Firestore Rules
- Left sidebar → **Firestore Database**
- Tab → **Rules**

### 3. Replace Rules
- Select ALL existing text
- Delete it
- Paste the rules from above
- Click **Publish**

### 4. Set Police Role in Firestore (IMPORTANT!)

**Your system stores roles in the `users` collection, NOT custom claims.**

Go to **Firebase Console → Firestore Database → Collections → users**

- Find your police user document
- Edit the document (click the pencil icon)
- **Add or update** the `role` field:
  - Field name: `role`
  - Value: `police` (as string)
  - Click **Update**

**Example user document:**
```json
{
  "email": "officer@police.com",
  "name": "John Officer",
  "role": "police"
}
```

*Repeat for all police users*

---

## Verification Checklist

After applying rules:

- [ ] Can user submit crime report (`/report` page) → Saves to `reports` collection
- [ ] Can police view reports on `/police/reports` page
- [ ] Can police click a report to open modal
- [ ] Can police change status dropdown → Shows "Updating..."
- [ ] Console shows `[Police Reports] ✅ Report {id} status updated to {status}`
- [ ] Modal closes or status updates without alert error

---

## Troubleshooting: Still Getting "Permission Denied"

### 1. Verify the Role is Set Correctly
- **Firebase Console** → Firestore → **Collections** → `users`
- Find your police user document
- **Check**: Does it have `role: "police"` field?
  - Field type should be **String**
  - Value should be **police** (lowercase, no caps)
  - Save if changed

### 2. Check Your User ID Matches
- Open **browser console** (F12 → Console)
- After logging in, paste: `firebase.auth().currentUser.uid`
- Copy the UID
- Go to Firestore, search for that exact UID in the `users` collection
- **The Firestore document ID MUST match the Auth UID**

### 3. Verify User Document Exists
- The police user **must** have a document in the `users` collection
- The document ID **must match** their Firebase Auth UID
- Check that `role: "police"` field exists

### 4. Test the Rules (Firestore Rules Simulator)
- **Firebase Console** → Firestore → **Rules**
- Click **Rules Playground** (or **Simulator**)
- Set up a test:
  - **Authenticated UID**: `<your_police_user_uid>`
  - **Request**: Update operation
  - **Path**: `reports/test-report`
  - **Operation**: `update`
  - Click **Run**
  - Should show **✓ Allow** (green)

### 5. Clear Cache & Re-login
- **Close browser completely**
- **Clear cookies/cache** (or use incognito)
- Log back in as police user
- Try updating report again

### 6. Check Browser Console for Exact Error
- F12 → Console tab
- Look for errors from `[Police Reports]`
- Copy the exact error and share it

### 7. Common Mistakes
- ❌ Role set to "Police" instead of "police" (must be lowercase)
- ❌ Role stored in custom claims instead of `users` collection
- ❌ User document doesn't exist in Firestore
- ❌ Firestore Auth UID doesn't match document ID
- ❌ Forgot to Publish rules after editing

---

## Testing Flow

### For Police User:
1. Log in as police user (with `role: "police"` custom claim)
2. Navigate to `/police/reports`
3. Wait for reports to load (check console for `[Police Reports] Fetched X reports`)
4. Click any report to open modal
5. Change status dropdown
6. Should see "Updating..." button
7. Check console for `[Police Reports] ✅ Report X status updated to Y`

### For Regular User:
1. Log in as regular user
2. Go to `/report` page
3. Fill out and submit crime report
4. Report appears in `reports` Firestore collection
5. Police can now see it on `/police/reports`

---

## Collection Structure Reference

```
Firestore Collections:

reports/ (user submissions)
├── {reportId}
│   ├── crimeType: "Theft"
│   ├── description: "..."
│   ├── latitude: 37.7749
│   ├── longitude: -122.4194
│   ├── status: "Pending"
│   ├── timestamp: {Firestore Timestamp}
│   └── ... (other fields)

distressSignals/ (SOS alerts)
├── {signalId}
│   ├── userId: "user123"
│   ├── latitude: 37.7749
│   ├── longitude: -122.4194
│   ├── status: "Pending"
│   ├── respondedBy: "police123" (after police responds)
│   └── timestamp: {Firestore Timestamp}

users/ (user profiles)
├── {userId}
│   ├── email: "user@example.com"
│   ├── name: "John Doe"
│   └── role: "user" or "police"
```

---

## Need Help?

If police still can't update reports after applying these rules:

1. **Check browser console** (F12) for exact error messages
2. **Check Firestore logs**:
   - Firebase Console → Rules → Manage logs
   - Look for deny reasons
3. **Verify custom claims**:
   - Firebase Console → Users
   - Click police user → Custom claims section
   - Should show `"role": "police"`
4. **Clear browser cache** and reload

---

**Last Updated**: January 21, 2026  
**Related Files**: `src/components/police/CrimeReportsPanel.js`
