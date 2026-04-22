# RoadIntel — Admin Portal

A web-based dashboard for municipal authorities to monitor reported road damage, assign repair teams, and track resolution progress. Integrates with the [RoadIntel Mobile App](https://github.com/harshfiu/RoadIntel-Mobile) via shared Firebase Firestore.

> Built as part of a Software Engineering & Project Management (SEPM) course project.

---

## Features

- **Auth-Gated Access** — Email/password login via Firebase Auth; no public sign-up (admins provisioned in Firebase Console)
- **Dashboard** — Real-time stat cards (total, high, medium, low priority), SVG pie chart, top-5 priority report list
- **Reports Table** — Searchable and filterable report list with AI urgency scores; assign repair teams from a modal
- **Interactive Map** — React-Leaflet map with color-coded circle markers per report (red = High, orange = Medium, green = Low)
- **Teams Page** — View and manage repair teams (Alpha, Beta, Emergency); add new teams via modal
- **Mock ML Engine** — Deterministic urgency scoring per report (no model inference required)
- **Dark / Light Theme** — System-wide theme toggle

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18.3.1 + Vite 5.3.1 |
| Styling | Tailwind CSS 3.4.4 |
| Auth & Database | Firebase JS SDK v10 (modular) |
| Maps | React-Leaflet 4.2.1 + Leaflet 1.9.4 |
| Build Tool | Vite with `@vitejs/plugin-react` |

---

## Project Structure

```
Admin Portal RoadIntel/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example                  # Copy to .env and fill in values
│
└── src/
    ├── firebase.js               # Firebase app init — exports db, auth
    ├── App.jsx                   # Auth gate: LoadingSplash → LoginPage → AppShell
    │
    ├── context/
    │   └── ThemeContext.jsx      # Dark/light theme context
    │
    ├── utils/
    │   └── ml.js                 # runMockML(), URGENCY_COLORS, STATUS_COLORS
    │
    └── components/
        ├── LoginPage.jsx         # Dark centered login card
        ├── Sidebar.jsx           # Dark navy sidebar, nav items, user email, logout
        ├── DashboardPage.jsx     # Stats, pie chart, priority list
        ├── ReportsPage.jsx       # Reports table, search/filter, assign modal
        ├── MapPage.jsx           # React-Leaflet map with CircleMarker per report
        └── TeamsPage.jsx         # Repair team management
```

---

## Authentication Flow

```
App.jsx  (onAuthStateChanged)
  │
  ├── undefined  →  LoadingSplash    (checking auth state)
  ├── null       →  LoginPage        (not signed in)
  └── user       →  AppShell         (signed in)
                       └── Sidebar Logout → signOut(auth)
```

Admin accounts are created directly in the **Firebase Console** — there is no public registration flow in the portal.

---

## Firebase Setup

Connects to the shared Firebase project used by the mobile app:

- **Project ID:** `roadintel-e9555`
- **Region:** `asia-south1`
- **Rules:** Firestore test mode (open read/write)
- **Auth:** Email/Password provider

### Environment Variables

Copy `.env.example` to `.env` and fill in your Firebase config values:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

> `.env` is gitignored. Never commit real credentials.

### Firestore Collections

**`pothole_reports`**

| Field | Type | Description |
|---|---|---|
| `imageUrl` | string | `data:image/jpeg;base64,...` — full base64 image |
| `latitude` | number | GPS latitude |
| `longitude` | number | GPS longitude |
| `accuracy` | number | GPS accuracy in metres |
| `timestamp` | timestamp | Submission time |
| `status` | string | `"Reported"` · `"In Progress"` · `"Resolved"` |
| `assignedTo` | string | Repair team name — written by admin portal |

**`users/{uid}`**

| Field | Type | Description |
|---|---|---|
| `name` | string | Full name |
| `phone` | string | Phone number |
| `city` | string | City / area |
| `email` | string | Email address |
| `createdAt` | timestamp | Account creation time |

---

## Priority Scoring (Mock ML)

The `runMockML()` function in `src/utils/ml.js` assigns urgency and a J-score to each report client-side. Values are deterministic per Firestore document ID — the same report always gets the same score.

**Formula:**

```
J = 0.6 × (Ap / Amax) / (Rw / Rmax) + 0.4 × Td
```

| Variable | Description |
|---|---|
| `Ap` | Detected damage area (mocked) |
| `Amax` | Maximum area in current dataset |
| `Rw` | Road width context (mocked) |
| `Rmax` | Maximum road width in dataset |
| `Td` | Normalized time delta since report |

**Urgency thresholds:**

| Range | Label |
|---|---|
| J ≥ 0.65 | 🔴 High |
| J ≥ 0.35 | 🟠 Medium |
| J < 0.35 | 🟢 Low |

Scores are computed at page load and are not written back to Firestore.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project with Firestore and Email/Password Auth enabled

### Installation

```bash
git clone https://github.com/harshfiu/RoadIntel.git
cd "RoadIntel"
npm install
```

### Configuration

```bash
cp .env.example .env
# Edit .env with your Firebase config values
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Sign in with an admin account created in Firebase Console.

### Production Build

```bash
npm run build
npm run preview   # preview the production build locally
```

---

## Pages

### Dashboard
- Total, High, Medium, and Low priority report counts
- SVG donut chart of urgency distribution
- Top 5 highest-priority reports with J-scores

### Reports
- Full paginated table of all `pothole_reports` documents
- Search by location or status
- Filter by urgency (High / Medium / Low) and status
- Click any row to open a detail modal with the submitted image, GPS coordinates, timestamp, and team assignment dropdown

### Map
- All reports plotted as circle markers on a Leaflet map
- Red = High, Orange = Medium, Green = Low
- Click a marker to see report details in a popup

### Teams
- Lists active repair teams (Alpha, Beta, Emergency)
- Add new teams via modal
- Teams appear in the assignment dropdown on the Reports page

---

## Related

- **Mobile App:** [github.com/harshfiu/RoadIntel-Mobile](https://github.com/harshfiu/RoadIntel-Mobile)
- **Firebase Console:** `roadintel-e9555` (asia-south1)

---

## License

MIT
