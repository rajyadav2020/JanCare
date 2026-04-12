import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

export const getCrowdPredictions = async (date, department) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, {
      date,
      department
    });
    return response.data.predictions;
  } catch (error) {
    console.error('Error fetching ML predictions:', error.message);
    // Return mock data fallback for hackathon safety
    return [
      {"time_slot": "08:00 - 09:00", "predicted_patients": 45, "severity_color": "Yellow", "severity_label": "Moderate"},
      {"time_slot": "09:00 - 10:00", "predicted_patients": 70, "severity_color": "Red", "severity_label": "Highly Crowded"},
      {"time_slot": "10:00 - 11:00", "predicted_patients": 65, "severity_color": "Red", "severity_label": "Highly Crowded"},
      {"time_slot": "11:00 - 12:00", "predicted_patients": 40, "severity_color": "Yellow", "severity_label": "Moderate"},
      {"time_slot": "12:00 - 13:00", "predicted_patients": 15, "severity_color": "Green", "severity_label": "Empty"},
      {"time_slot": "14:00 - 15:00", "predicted_patients": 35, "severity_color": "Yellow", "severity_label": "Moderate"},
      {"time_slot": "15:00 - 16:00", "predicted_patients": 20, "severity_color": "Green", "severity_label": "Empty"},
      {"time_slot": "16:00 - 17:00", "predicted_patients": 10, "severity_color": "Green", "severity_label": "Empty"}
    ];
  }
};
