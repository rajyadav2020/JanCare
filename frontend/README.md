# 🏥 JanCare — Frontend
### AI-Based OPD Queue Management System

> A premium React-based frontend for the JanCare OPD Queue Optimization System. Built with a dark-mode glassmorphic design, this app delivers a real-time, ML-powered hospital appointment experience.

![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.3-06B6D4?logo=tailwindcss&logoColor=white)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **ML Slot Predictions** | Color-coded time slots (Green/Yellow/Red) based on ML crowd predictions |
| 📊 **Live Queue Tracker** | Real-time queue position with auto-refresh every 10 seconds |
| ⏱️ **Wait Time Calculator** | Estimated wait time based on patients ahead × avg consultation time |
| 🔊 **Voice Readout** | Multi-language (EN/HI) text-to-speech for booking confirmations |
| ❌ **Cancel & Rebook** | One-click cancellation with smart AI-powered slot recommendations |
| ⚠️ **Peak Hour Warning** | Warns users when selecting busy slots, suggests better alternatives |
| ☕ **Doctor Break Alerts** | Live banner when department doctor is on break |
| 🎫 **QR Digital Pass** | Scannable QR code for each booking |
| 🌐 **Bilingual (EN/HI)** | Full English and Hindi language support |
| 🌙 **Premium Dark Theme** | Glassmorphic design with animated backgrounds |

---

## 🏗️ Architecture

This is the **frontend** of a 3-service microservice system:

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│  ML Service   │
│  (React/Vite)│     │ (Node/Express)│    │  (FastAPI)    │
│  Port: 5173  │     │  Port: 5000  │     │  Port: 8000  │
└─────────────┘     └──────┬───────┘     └──────────────┘
                           │
                    ┌──────▼───────┐
                    │  MongoDB     │
                    │  (Atlas)     │
                    └──────────────┘
```

### Related Repositories
- 🔧 **Backend**: [backend-ai-based-queue-management-system](https://github.com/rajyadav2020/backend-ai-based-queue-management-system)
- 🧠 **ML Service**: [ml_service-ai-based-queue-management-system](https://github.com/rajyadav2020/ml_service-ai-based-queue-management-system)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Backend and ML Service running (see links above)

### Installation

```bash
# Clone the repo
git clone https://github.com/rajyadav2020/ai-based-crowd-management-system.git
cd ai-based-crowd-management-system

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be running at `http://localhost:5173`

### Environment
The frontend connects to the backend at `http://localhost:5000/api` by default (configured in `src/api.js`).

---

## 📁 Project Structure

```
src/
├── api.js                  # API layer (all backend calls)
├── translations.js         # EN/HI language strings
├── App.jsx                 # Main app shell with routing
├── index.css               # Global styles + animations
└── components/
    ├── LandingPage.jsx     # Public landing page
    ├── AuthPage.jsx        # Patient login/register
    ├── AdminAuthPage.jsx   # Admin login/register
    ├── BookingUI.jsx       # Slot booking with ML predictions
    ├── ProfileUI.jsx       # My Bookings + QR passes
    └── AdminDashboard.jsx  # Analytics + Queue management
```

---

## 🛠️ Tech Stack

- **React 18** — Component-based UI
- **Vite 5** — Lightning-fast HMR
- **Tailwind CSS 3** — Utility-first styling
- **Recharts** — Admin analytics charts
- **Lucide React** — Icon system
- **QRCode.react** — Dynamic QR code generation
- **Axios** — HTTP client
- **Web Speech API** — Browser-native voice readout

---

## 👥 Team

Built for **Hackachinno Hackathon** by Raj Yadav, Yash bansal , Aman bansal , Achal tyagi , Aaditya nagar
