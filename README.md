# ISS Tracker — Live Space Station Flight Telemetry HUD
### Edzul 5-Day Development Challenge

[![Deploy Next.js to GitHub Pages](https://github.com/srakshitha0802/ISS-tracker/actions/workflows/deploy.yml/badge.svg)](https://github.com/srakshitha0802/ISS-tracker/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Live_Site-GitHub_Pages-06b6d4?style=flat&logo=github)](https://srakshitha0802.github.io/ISS-tracker/)
 [![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-06b6d4?style=flat&logo=tailwindcss)](https://tailwindcss.com)
[![Tests Passing](https://img.shields.io/badge/Tests-35%2F35%20Pass-10b981?style=flat&logo=vitest)](https://github.com/srakshitha0802/ISS-tracker)
[![Dual APIs](https://img.shields.io/badge/APIs-WhereTheISS%20%2B%20Gemini-6366f1?style=flat)](https://aistudio.google.com)

An advanced, real-time aerospace flight telemetry and geospatial tracking web application for the **International Space Station (ISS, NORAD Catalog #25544)**. Powered by two primary APIs: the gold-standard **Where The ISS At? API** for real-time orbital vectors and the **Google Gemini AI API** for autonomous orbital AI Chatbot intelligence. Engineered with a sharp-edged mission control HUD aesthetic, audible 4K MP4 cosmic ambient soundtrack with 1-click unmuting and volume controls, precision Keplerian orbital mechanics, forward trajectory projections, 3D observer distance radar, and live Expedition 72 crew dossier.

🌐 **Live URL**: [https://srakshitha0802.github.io/ISS-tracker/](https://srakshitha0802.github.io/ISS-tracker/)  
📦 **Repository**: [https://github.com/srakshitha0802/ISS-tracker](https://github.com/srakshitha0802/ISS-tracker)

---

## 1. Key Architectural & Design Features

### 1.1. Sharp Aerospace HUD & Theme Design System
- **Crisp Sharp Edges**: All components, cards, tables, badges, and modals feature sharp rectangular geometry (`rounded-none`) with laser-aligned corner accent brackets.
- **Deep Space Theme Palette**:
  - **Obsidian Slate Base**: `#020617` / `slate-950`
  - **Telemetry Cyan**: `#06b6d4` & `#22d3ee`
  - **Solar & Mach Amber**: `#f59e0b` & `#fbbf24`
  - **Signal Emerald**: `#10b981` & `#34d399`
- **Custom Precision Vector ISS Logo**: Bespoke SVG insignia featuring authentic space station architecture (central truss structure, port/starboard dual-axis photovoltaic solar wings, pressurized habitat modules, and orbital vector arcs).

### 1.2. High-Definition Audible Cosmic Video Background
- **Audible 4K Ambient Soundtrack**: Real-time atmospheric space audio with 1-click unmuting, animated audio equalizer, and volume slider.
- **Autoplay Compliance & Gesture Recovery**: Initial muted autoplay adheres to strict browser security policies; seamlessly unmuted upon 1-click user interaction without stutter.
- **Live Ambiance Controller**: Switch between **Cinema** (translucent HUD tint), **Vivid** (100% transparent zero-blur space view), and **Focus** (dark contrast analysis view).

### 1.3. AI Chatbot Intelligence Engine
- **Autonomous Aerospace Analyst**: Directly connects to the **Google Gemini API** (`gemini-flash-latest`).
- **Real-Time Telemetry Synthesis**: Injects live latitude, longitude, altitude, velocity, daylight status, and overflight territory into AI flight dynamic briefings.
- **Interactive Mission Terminal**: Run preset inquiries (How AI Works, Orbital Free-Fall Physics, Expedition 72 Science, ARISS HAM Radio Doppler shifts) or ask custom astrophysics questions.
- **Client & Server Key Management**: Optional direct API key configuration stored securely in browser `localStorage`.

### 1.4. Real-Time Telemetry & Failover Reliability (Where The ISS At? API)
- **Where The ISS At? REST API Integration**: Regular polling with exponential backoff and rate-limit preservation.
- **Antimeridian ($\pm 180^\circ$) Date Line Split Algorithm**: Automatically detects when the space station crosses the 180th meridian and splits trajectory polylines to prevent horizontal canvas wrapping artifacts.
- **Dual Connection Pipeline**: Direct browser fetch with CORS support for GitHub Pages static hosting, backed by same-origin proxy fallbacks for server runtimes.

### 1.5. Forward Orbit Track & Sighting Distance Radar
- **90-Minute Future Orbit Track**: Projects next orbital path factoring orbital inclination ($51.64^\circ$) and Earth rotation.
- **3D Ground Distance & Slant Range**: Computes great-circle ground distance (Haversine) and true line-of-sight Euclidean distance through space factoring 420 km altitude.
- **Horizon Elevation Angles**: Instant visual sighting notifications when the ISS is above the user's horizon ($> 10^\circ$).

### 1.6. Live Expedition 72 Crew Dossier
- Real-time roster of the 7 astronauts and cosmonauts currently residing on board the space station, detailing roles, launch vehicles (SpaceX Crew-9, Soyuz MS-26), days in orbit, and spacewalk (EVA) logs.

### 1.7. Mission Control Web Audio API Synthesizer
- Built-in sound effects engine using native Web Audio API oscillators:
  - Apollo Quindar-style telemetry confirmation tone ($2524\text{ Hz}$).
  - Soft radar ping on coordinate refresh.
  - UI button tactile chimes with mute toggle.

---

## 2. Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.4.2 (App Router) | Static export compatibility for GitHub Pages |
| **Runtime** | React 19.3.0 | Modern client architecture & hooks |
| **Styling** | Vanilla CSS + Tailwind CSS v4 | Soft modern glassmorphism design system |
| **Telemetry API** | Where The ISS At? API | Real-time orbital vector and kinematics downlink |
| **AI Copilot API** | Google Gemini AI API | Autonomous orbital dynamics intelligence (`gemini-flash-latest`) |
| **Mapping Engine** | Leaflet 1.9.4 & React-Leaflet 5.0 | Multi-layer interactive geospatial world map |
| **Icons** | Lucide React | High-contrast vector icons (zero cartoon emojis) |
| **Audio** | Native HTML5 Video + Web Audio API | Stereo 48kHz soundtrack + Quindar synthesizer |
| **Testing** | Node.js Test Runner | 44/44 passing tests covering math, APIs, and validation |
| **CI/CD** | GitHub Actions | Automated build & deploy to GitHub Pages |

---

## 3. Local Development

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher

### Installation & Run
```bash
# Clone the repository
git clone https://github.com/srakshitha0802/ISS-tracker.git
cd ISS-tracker

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the live dashboard.

### Run Quality Gates & Tests
```bash
# Run 44 comprehensive automated tests
npm test

# Run ESLint check
npm run lint

# Build static production bundle for GitHub Pages
npm run build:gh-pages
```

---

## 4. Deployment to GitHub Pages

This repository is configured with a GitHub Actions workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) that automatically runs tests, builds the static export, and deploys to GitHub Pages upon pushing to the `main` branch.

To enable GitHub Pages in your GitHub repository settings:
1. Go to **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, choose **GitHub Actions**.
3. Push to `main`, and the deployment will complete automatically.

---

## 5. License & Credits
Developed for the **Edzul 5-Day Development Challenge**.  
- Real-Time Orbital Telemetry: [Where The ISS At? API](https://wheretheiss.at) by Bill Shupp.  
- AI Chatbot: [Google Gemini AI API](https://aistudio.google.com).  
- Map Data: © [OpenStreetMap](https://www.openstreetmap.org/copyright) and [CARTO](https://carto.com).

2. Project Overview

The ISS Tracker is a web application that displays real-time information about the International Space Station (ISS). It helps users understand the station's current location and orbital movement.

3. Main Features

- Displays the ISS location using live API data.
- Shows telemetry information such as latitude, longitude, and altitude when available.
- Provides an interactive space-themed dashboard.
- Displays projected orbital paths and station information.
- Includes an AI Chatbot for space-related and multi-domain questions.

4. APIs Used

Where the ISS At? API

Used to retrieve ISS location and telemetry information.

Google Gemini AI API

Used to support AI Chatbot responses and space-related questions.

Limitations:

- Live data depends on API availability and internet connectivity.
- API requests may fail due to server errors or rate limits.
- AI responses may not always be accurate.
- API keys must be protected and should never be published in the repository.

5. Setup Instructions

1. Open the project repository on GitHub.
2. Download or clone the project to a computer.
3. Install Node.js and npm.
4. Open a terminal in the project folder.
5. Run "npm install".
6. Configure the required environment variables using the project's example environment file.
7. Run "npm run dev".
8. Open the local URL shown in the terminal to test the application.

Note: Follow the actual scripts and configuration in "package.json" and the project documentation.

6. Testing

The project README reports 35 out of 35 tests passing. This should be verified against the latest test results.

Testing checklist:

- Check whether the application loads successfully.
- Verify that live ISS information is displayed.
- Check the displayed coordinates and telemetry.
- Test the AI assistant if its API is configured.
- Check the interface on mobile and desktop screens.
- Test how the application responds when the internet or an API is unavailable.

7. Demo Plan (3–5 Minutes)

1. Introduction (30 seconds): Introduce the ISS Tracker and its purpose.
2. Dashboard (1 minute): Show the interface and explain its main features.
3. Live tracking (1 minute): Demonstrate the ISS location and available telemetry.
4. AI assistant (1 minute): Show how the assistant answers a space-related question, if available.
5. Testing and conclusion (30–60 seconds): Explain the tests, API limitations, and future improvements.

8. Team Contributions

- Project development: [Add the responsible team member's name and contribution.]
- API integration: [Add the responsible team member's name and contribution.]
- Documentation and demo: [Add your name and describe your work.]
- Testing: [Add the responsible team member's name and contribution.]

Update this section with the actual contributions of every team member.

9. Future Improvements

- Improve error handling when APIs are unavailable.
- Add more detailed ISS tracking information.
- Improve accessibility and mobile responsiveness.
- Expand automated testing and documentation.
