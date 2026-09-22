# RoadIntel — Admin Dashboard

**Which pothole gets fixed first?**

Citizens file reports from the [RoadIntel mobile app](https://github.com/harshfiu/RoadIntel-Mobile);
this is the side that decides what to do about them. Every report that lands in
Firestore appears here within a second, scored, ranked, plotted on a map, and ready to
be handed to a repair crew.

A React + Vite + Tailwind single-page app behind a Firebase auth gate.

---

## What it does

- **Live queue** — a Firestore `onSnapshot` subscription, so a report submitted in the
  field shows up without a refresh.
- **Priority ranking** — every report is scored and the list is sorted by that score,
  highest first. The queue is ordered by consequence, not by arrival time.
- **Dashboard** — totals for reported, assigned and fixed work, a critical-count card,
  a breakdown of reports by urgency, and the current top-priority reports.
- **Reports** — search, filter by status and urgency, sort, open a report to see its
  photo and coordinates, then assign a crew. Assigning writes `status: Assigned` and
  the crew name straight back to Firestore, where the mobile app picks it up.
- **Map** — every geotagged report as a colour-coded marker over OpenStreetMap, with
  urgency and status filters and a legend. The view centres on the reports themselves.
- **Teams** — crew roster with zone, supervisor, specialty and availability.
- **Dark mode** — dark by default, toggled across the whole UI.

## The priority formula

Reports are ranked by a weighted score taken from my published pothole detection and
priority-ranking research:

```
J = w₁ × (Aₚ/Aₘₐₓ) / (R_w/Rₘₐₓ) + w₂ × T_d        w₁ = 0.6, w₂ = 0.4
```

A large pothole (`Aₚ`) on a narrow road (`R_w`) with heavy traffic (`T_d`) outranks a
bigger one on a wide, empty road — the formula is about disruption caused, not size
alone. `J` maps to Critical / High / Medium / Low bands and to a 0–100 priority number.

**Worth being straight about:** `src/utils/ml.js` computes that formula over
*placeholder* measurements, seeded from each report's document ID so the same report
always scores the same. The ranking pipeline is real and deterministic; the vision
model that would supply `Aₚ`, `R_w` and `T_d` from the photo is not wired in yet. That
is the next piece of work, and the formula is where it plugs in.

The teams roster is likewise seeded with sample crews held in component state — added
teams live for the session, not in Firestore.

## Tech stack

| | |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3 |
| **Data** | Firebase Firestore (real-time listeners) |
| **Auth** | Firebase Authentication |
| **Maps** | react-leaflet + OpenStreetMap |
| **Charts** | hand-rolled SVG — no charting dependency |

## Running it

```bash
npm install
cp .env.example .env    # fill in your Firebase web-app config
npm run dev
```

It reads the same Firestore project and `pothole_reports` collection the mobile app
writes to. Sign-in uses Firebase Authentication, so create a user in the Firebase
console first — there is no public sign-up on the admin side, by design.

`npm run build` emits a static bundle to `dist/`.

## Structure

```
src/App.jsx              auth gate, Firestore subscription, page routing
src/components/
  DashboardPage.jsx      stat cards, urgency breakdown, top priority list
  ReportsPage.jsx        search, filters, detail view, crew assignment
  MapPage.jsx            Leaflet map with filters and legend
  TeamsPage.jsx          crew roster
  LoginPage.jsx          Firebase email/password sign-in
  Sidebar.jsx            navigation, signed-in user, sign out
src/utils/ml.js          priority formula + urgency/status colour maps
src/firebase.js          Firebase init from env vars
```

---

Part of [RoadIntel](https://github.com/harshfiu/RoadIntel-Mobile) · more of my work at
[harshgupta.co.in](https://www.harshgupta.co.in)
