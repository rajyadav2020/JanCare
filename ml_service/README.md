# 🧠 JanCare — ML Prediction Service
### AI-Based OPD Queue Management System

> Machine Learning microservice that predicts hospital OPD crowd density per department per time slot. Uses a trained RandomForest model on historical footfall data to enable smart slot booking.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.3-F7931E?logo=scikit-learn&logoColor=white)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **RandomForest Model** | Trained on 50,000+ historical OPD records across 6 departments |
| 📈 **Crowd Predictions** | Predicts patient count per hour per department for any future date |
| 🔄 **Deterministic Variance** | Crypto-hash based weekly variance for organic-looking predictions |
| ⚡ **FastAPI** | High-performance async API with automatic OpenAPI docs |
| 🏥 **6 Departments** | Orthopedics, Pediatrics, Cardiology, Dermatology, Neurology, General Medicine |
| ⏰ **8 Time Slots** | Full day coverage: 08:00 to 17:00 (with lunch break) |

---

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│  THIS REPO   │
│  (React/Vite)│     │ (Node/Express)│    │  (FastAPI)    │
│  Port: 5173  │     │  Port: 5000  │     │  Port: 8000  │
└─────────────┘     └──────────────┘     └──────────────┘
```

### Related Repositories
- 🖥️ **Frontend**: [ai-based-crowd-management-system](https://github.com/rajyadav2020/ai-based-crowd-management-system)
- 🔧 **Backend**: [backend-ai-based-queue-management-system](https://github.com/rajyadav2020/backend-ai-based-queue-management-system)

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+

### Installation

```bash
# Clone the repo
git clone https://github.com/rajyadav2020/ml_service-ai-based-queue-management-system.git
cd ml_service-ai-based-queue-management-system

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt

# Generate training data (if not present)
python generate_data.py

# Train the model
python train_model.py

# Start the server
python -m uvicorn app:app --reload
```

The API will be running at `http://localhost:8000`

### API Documentation
Visit `http://localhost:8000/docs` for interactive Swagger UI.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/predict?date=2026-04-12&department=Cardiology` | Get crowd predictions for a date + department |
| GET | `/health` | Health check |
| GET | `/docs` | Swagger UI documentation |

### Sample Response

```json
[
  {
    "time_slot": "09:00 - 10:00",
    "predicted_patients": 34,
    "severity_color": "Yellow",
    "severity_label": "Moderate"
  },
  {
    "time_slot": "14:00 - 15:00",
    "predicted_patients": 12,
    "severity_color": "Green",
    "severity_label": "Low"
  }
]
```

---

## 📁 Project Structure

```
├── app.py              # FastAPI server + prediction endpoint
├── train_model.py      # Model training script (RandomForest)
├── generate_data.py    # Synthetic historical data generator
├── requirements.txt    # Python dependencies
├── data/
│   └── historical_opd.csv   # 50K+ training records
└── models/
    ├── crowd_model.pkl       # Trained RandomForest model
    └── dept_encoder.pkl      # Department label encoder
```

---

## 🧪 How the ML Works

1. **Data Generation** (`generate_data.py`): Creates realistic hospital footfall patterns with:
   - Day-of-week patterns (Mon peak, Sun low)
   - Time-of-day curves (morning rush, lunch dip)
   - Department-specific load profiles

2. **Training** (`train_model.py`): 
   - Features: `day_of_week`, `month`, `hour`, `department_encoded`
   - Model: `RandomForestRegressor` (100 trees)
   - Output: Predicted patient count per slot

3. **Serving** (`app.py`):
   - Receives date + department from backend
   - Adds deterministic weekly variance via crypto-hashing
   - Returns 8 time-slot predictions with severity labels

---

## 🛠️ Tech Stack

- **FastAPI** — Async REST API
- **scikit-learn** — RandomForest model
- **pandas** — Data processing
- **joblib** — Model serialization
- **NumPy** — Numerical operations

---

## 👥 Team

Built for **Hackachinno Hackathon** by Raj Yadav, Yash bansal , Aman bansal , Achal tyagi , Aaditya nagar
