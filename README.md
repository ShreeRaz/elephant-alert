# 🐘 Elephant Alert

A React Native geospatial community safety application built to help residents of human-elephant conflict zones in eastern Nepal receive real-time alerts about elephant movement and stay safe.

---

## Why This Project Exists

Jhapa and other districts in eastern Nepal sit along known elephant migration corridors. Every year, encounters between wild elephants and local communities lead to loss of crops, property damage, injuries, and sometimes fatalities — while elephants themselves are frequently harmed or killed in retaliatory or defensive incidents.

Most of these tragedies happen because communities have **no early-warning system**. Word of an elephant sighting spreads slowly through informal word-of-mouth, phone calls, or local social media groups — by which point people may already be in the animal's path.

Elephant Alert was built to close that gap: a lightweight, location-aware mobile app that lets community members report elephant sightings instantly and receive alerts when elephants are reported near their location, turning a fragmented, slow warning process into a fast, shared, map-based one.

> **Good to know:** This project was built as a portfolio/community-safety proof of concept, aimed at demonstrating how geospatial mobile tooling can be applied to a real, local problem rather than a generic tutorial use case.

---

## Key Features

- **Real-time sighting reports** — Users can report an elephant sighting with their current GPS location in a couple of taps.
- **Proximity-based alerts** — Community members within a configurable radius of a reported sighting are notified.
- **Interactive map view** — Sightings are plotted on a live map so users can visually assess nearby risk.
- **Community-driven data** — The alert network relies on crowdsourced reports rather than a single centralized authority, making it scalable to any village or corridor.
- **Lightweight, offline-friendly UX** — Designed with low-bandwidth rural connectivity in mind.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native |
| Location & Mapping | Device Geolocation APIs, map/marker rendering for sighting visualization |
| State Management | React Hooks / Context |
| Backend & Data | REST API layer for storing and broadcasting sighting reports |
| Notifications | Push/local notification system for proximity alerts |

*Good to know: swap in your exact package names (e.g., `react-native-maps`, `expo-location`, Firebase, etc.) here so the README reflects the precise implementation.*

---

## How It Works

1. A user spots an elephant and opens the app.
2. They submit a report — the app automatically captures their GPS coordinates and timestamp.
3. The report is broadcast to the backend, which identifies nearby users within the alert radius.
4. Those users receive a push notification and can view the sighting on the map to plan a safe route or stay indoors.

---

## Impact

- Provides communities in elephant corridor regions with a **faster, decentralized way to share safety information**, reducing reliance on slow word-of-mouth warnings.
- Demonstrates a practical application of **geospatial mobile development** to a real human-wildlife conflict problem specific to eastern Nepal.
- Serves as a foundation that could be extended with wildlife authority partnerships, historical movement analytics, or SMS-based alerts for users without smartphones.

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/<your-username>/elephant-alert.git
cd elephant-alert

# Install dependencies
npm install

# Run on Android/iOS
npx react-native run-android
# or
npx react-native run-ios
```

> **Good to know:** Update the clone URL, environment variable setup (API keys, map provider tokens), and platform-specific setup steps to match your actual repo before publishing.

---

## Roadmap

- [ ] SMS-based alerts for non-smartphone users
- [ ] Integration with forest/wildlife authority data feeds
- [ ] Historical heatmap of elephant movement patterns
- [ ] Multilingual support (Nepali, English)

---

## Author

Built by **Ankitraj Kadel** — Full-Stack Developer (MERN, Next.js, TypeScript)
