# Police Module - Quick Reference

## 📁 File Structure

```
src/
├── app/
│   └── police/
│       ├── page.js                 (Main dashboard)
│       ├── reports/
│       │   └── page.js             (Crime reports)
│       ├── sos/
│       │   └── page.js             (SOS alerts)
│       └── heatmap/
│           └── page.js             (Crime heatmap)
│
├── components/
│   └── police/
│       ├── PoliceSidebar.js        (Desktop sidebar)
│       ├── PoliceMobileNav.js       (Mobile drawer nav)
│       ├── PoliceDashboard.js       (Dashboard panel)
│       ├── CrimeReportsPanel.js     (Reports panel)
│       ├── SOSMonitorPanel.js       (SOS panel)
│       └── CrimeHeatmapPanel.js     (Heatmap panel)
│
└── styles/
    └── police.css                   (All police styles - 2200+ lines)
```

## 🚀 Features Implemented

| Feature | Status | File | Notes |
|---------|--------|------|-------|
| Dashboard | ✅ | `PoliceDashboard.js` | Stats, SOS alerts, recent reports |
| Crime Reports | ✅ | `CrimeReportsPanel.js` | Search, filter, detail modal |
| SOS Monitor | ✅ | `SOSMonitorPanel.js` | Active alerts, dispatch controls |
| Crime Heatmap | ✅ | `CrimeHeatmapPanel.js` | Interactive map, hotspots, trends |
| Desktop Nav | ✅ | `PoliceSidebar.js` | Sticky sidebar with menu |
| Mobile Nav | ✅ | `PoliceMobileNav.js` | Hamburger drawer menu |
| Responsive CSS | ✅ | `police.css` | Mobile-first, media queries |

## 🎨 CSS Classes Reference

### Layout
- `.police-page` - Main wrapper
- `.police-desktop-sidebar` - Sidebar container
- `.police-main-content` - Main content flex container
- `.police-content-area` - Scrollable content area

### Components
- `.police-sidebar` - Desktop sidebar
- `.police-mobile-nav` - Mobile header
- `.police-modal-overlay` - Modal backdrop
- `.police-modal-content` - Modal dialog

### Content
- `.police-page-header` - Page title section
- `.police-stats-grid` - Stats card container
- `.police-filters-card` - Filter controls
- `.police-reports-list` - Reports container
- `.police-sos-item` - Individual SOS alert
- `.police-heatmap-visualization` - Heatmap canvas

## 🔧 Responsive Breakpoints

```css
/* Mobile: < 700px */
@media (max-width: 700px) {
  /* Single column, hamburger menu */
}

/* Tablet & Desktop: >= 700px */
/* Desktop: >= 1024px */
@media (min-width: 1024px) {
  /* Sidebar visible */
}
```

## 📊 Mock Data Locations

### Reports
- `src/components/police/CrimeReportsPanel.js` - `mockReports` array (lines 7-50)
- `src/components/police/PoliceDashboard.js` - `mockReports` array (lines 7-10)

### SOS Alerts
- `src/components/police/SOSMonitorPanel.js` - `mockSOSAlerts` array (lines 7-28)
- `src/components/police/PoliceDashboard.js` - `mockSOSAlerts` array (lines 12-15)

### Hotspots
- `src/components/police/CrimeHeatmapPanel.js` - `mockHotspots` array (lines 7-50)

## 🔐 Firebase Collections (To Create)

1. **policeReports** - Crime reports with status, location, media
2. **sosAlerts** - Emergency SOS alerts with real-time location
3. **policeOfficers** - Police officer profiles and assignments
4. **crimeHotspots** - Historical crime pattern data
5. **users** - Add `role` field for police verification

⚠️ See `POLICE_MIGRATION_SUMMARY.md` for detailed schema

## 🎯 Integration Checklist

- [ ] Create Firestore collections (see schema)
- [ ] Set up Security Rules
- [ ] Add police role to Firebase Auth custom claims
- [ ] Implement police login in `src/firebase/auth.js`
- [ ] Replace mock data with Firestore queries
- [ ] Set up real-time listeners for alerts
- [ ] Test responsive design on mobile/tablet
- [ ] Implement location services for heatmap
- [ ] Add officer assignment logic

## 🌐 Route Mapping

```
/police                   → Dashboard
/police/reports          → Crime Reports
/police/sos              → SOS Monitor
/police/heatmap          → Crime Heatmap
```

## 📝 Key Implementation Notes

### No TypeScript
- All files `.js` extension
- No interfaces or type definitions
- Plain JavaScript with React hooks

### Client Components
- `"use client"` on all interactive pages
- Uses `useState` for local state
- Ready for Firestore integration

### Styling Approach
- Global CSS only (no CSS Modules)
- All selectors scoped under `.police-page`
- Media queries for responsive behavior
- No `body` or global element styles

### Components Are Self-Contained
- Each panel has internal state
- Uses mock data arrays
- Ready to accept props for real data
- Modal handling built-in

## 🎨 Color Palette

- **Primary**: `#1a2b4a` (Navy Blue)
- **Danger/Alert**: `#dc2626` (Red)
- **Warning**: `#f59e0b` (Amber)
- **Success**: `#16a34a` (Green)
- **Border**: `#e5e7eb` (Light Gray)
- **Background**: `#f9fafb` (Off White)
- **Text**: `#1a2b4a`, `#6b7280`, `#9ca3af`

## 🔄 State Management Pattern

```javascript
const [selectedReport, setSelectedReport] = useState(null);
const [filterStatus, setFilterStatus] = useState("all");
const [searchTerm, setSearchTerm] = useState("");

// Filter logic
const filtered = mockData.filter(item => {
  const matchesStatus = filterStatus === "all" || item.status === filterStatus;
  const matchesSearch = item.id.includes(searchTerm);
  return matchesStatus && matchesSearch;
});
```

## ✨ CSS Animations

- **pulse**: 2s opacity fade (alerts)
- **bounce**: 2s translateY (map markers)
- **slideInLeft**: 0.3s transform (mobile drawer)
- **pulse-grow**: 2s scale transform (location marker)

## 📱 Mobile-Specific Changes (<700px)

- Sidebar hidden, drawer replaces it
- Header shows hamburger menu
- Content padding reduced (16px → 24px)
- Grid layouts collapse to 1-2 columns
- Modal full-width with less padding
- Touch-friendly button sizes

## 🚨 Known Limitations (To Be Fixed)

- Mock data only (needs Firestore integration)
- No real authentication (mock `useState(true)`)
- No location services (coordinates in DB only)
- No real-time notifications
- No push notifications for alerts
- No officer location tracking

---

**Last Updated**: January 2026  
**Migration Status**: ✅ Complete - Ready for Firebase Integration
