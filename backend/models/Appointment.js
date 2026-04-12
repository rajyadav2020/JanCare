import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientEmail: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true,
    default: "Patient"
  },
  patientAge: {
    type: Number,
    default: null
  },
  patientGender: {
    type: String,
    default: null
  },
  department: {
    type: String,
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  timeSlot: {
    type: String, // e.g. "09:00 - 10:00"
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'No-Show'],
    default: 'Scheduled'
  },
  admittedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);
