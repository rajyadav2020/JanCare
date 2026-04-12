# 🔧 JanCare — Backend API
### AI-Based OPD Queue Management System

> RESTful API server powering the JanCare OPD Queue Optimization System. Handles authentication, appointment management, real-time queue tracking, doctor availability, and interfaces with the ML prediction service.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Auth** | Separate patient & admin authentication with bcrypt password hashing |
| 📅 **Smart Booking** | Duplicate detection, capacity-aware slot booking with ML fusion |
| 📊 **Hybrid Predictions** | Combines ML walk-in predictions + real-time MongoDB bookings |
| ⏱️ **Wait Time Engine** | Calculates estimated wait per patient (people ahead × 8 min avg) |
| ❌ **Cancel + Recommend** | On cancellation, auto-suggests the best alternative green slot |
| ☕ **Doctor Availability** | Toggle department doctors On Break / Available in real-time |
| ↔️ **Queue Transfer** | Transfer patients between departments (e.g., referrals) |
| 🚫 **No-Show Detection** | Auto-mark patients who miss their turn as No-Show |
| 📱 **SMS/WhatsApp** | Twilio integration for booking confirmations (mock fallback) |

---

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│  THIS REPO   │────▶│  ML Service   │
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
- 🖥️ **Frontend**: [ai-based-crowd-management-system](https://github.com/rajyadav2020/ai-based-crowd-management-system)
- 🧠 **ML Service**: [ml_service-ai-based-queue-management-system](https://github.com/rajyadav2020/ml_service-ai-based-queue-management-system)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- ML Service running on port 8000

### Installation

```bash
# Clone the repo
git clone https://github.com/rajyadav2020/backend-ai-based-queue-management-system.git
cd backend-ai-based-queue-management-system

# Install dependencies
npm install

# Create .env file (see below)
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/hackathon_opd
JWT_SECRET=your_jwt_secret_here
ML_SERVICE_URL=http://localhost:8000

# Twilio (optional, falls back to console mock)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Patient registration |
| POST | `/api/auth/login` | Patient login |
| POST | `/api/auth/admin/register` | Admin registration |
| POST | `/api/auth/admin/login` | Admin login |

### Patient Routes (JWT Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/predictions?date=&department=` | Get ML crowd predictions + live seat count |
| POST | `/api/appointments` | Book an appointment |
| GET | `/api/appointments` | Get user's appointments with queue position |
| DELETE | `/api/appointments/:id` | Cancel appointment + get slot recommendation |
| GET | `/api/doctor-status` | Check doctor availability per department |

### Admin Routes (Admin JWT Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/appointments` | Get ALL hospital appointments |
| PUT | `/api/admin/appointments/:id/status` | Admit / Finish patient |
| PUT | `/api/admin/appointments/:id/transfer` | Transfer to another department |
| GET | `/api/admin/doctor-status` | Get doctor availability map |
| PUT | `/api/admin/doctor-status/:department` | Toggle doctor on break/available |
| POST | `/api/admin/no-show-check` | Scan and mark no-show patients |

---

## 📁 Project Structure

```
├── server.js                    # Main Express app + all routes
├── models/
│   ├── User.js                  # Patient schema (bcrypt)
│   ├── Admin.js                 # Admin schema (bcrypt)
│   └── Appointment.js           # Appointment schema
├── middleware/
│   ├── authMiddleware.js        # Patient JWT verification
│   └── adminAuthMiddleware.js   # Admin JWT verification
├── services/
│   ├── mlService.js             # FastAPI ML bridge
│   └── messagingService.js      # Twilio SMS/WhatsApp
├── package.json
└── .env                         # Secrets (not committed)
```

---

## 🛠️ Tech Stack

- **Express 4.18** — REST API framework
- **Mongoose 7** — MongoDB ODM
- **JWT** — Stateless authentication
- **bcryptjs** — Password hashing
- **Axios** — ML service communication
- **Twilio** — SMS/WhatsApp notifications

---

## 👥 Team

Built for **Hackachinno Hackathon** by Raj Yadav, Yash bansal , Aman bansal , Achal tyagi , Aaditya nagar
