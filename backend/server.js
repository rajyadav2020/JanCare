import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import Appointment from './models/Appointment.js';
import User from './models/User.js';
import { getCrowdPredictions } from './services/mlService.js';
import { protect } from './middleware/authMiddleware.js';
import { adminProtect } from './middleware/adminAuthMiddleware.js';
import { sendBookingConfirmation } from './services/messagingService.js';
import Admin from './models/Admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hackathon_opd';
const JWT_SECRET = process.env.JWT_SECRET || 'hackathon_secret_123';

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Restrict to your Vite Frontend
  credentials: true
}));
app.use(express.json());

// Database connection (No strict checking to ensure speed for hackathon)
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected to', MONGO_URI))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// --- AUTH ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, phone, adhhar, age, gender } = req.body;
  if (!username || !email || !password || !phone || !adhhar || !age || !gender) {
    return res.status(400).json({ error: 'Please add all fields' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: 'User already exists' });

    const user = await User.create({ username, email, password, phone, adhhar, age, gender });
    if (user) {
      res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ error: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [
        { email: email },
        { phone: email }
      ]
    });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin Register
app.post('/api/auth/admin/register', async (req, res) => {
  const { email, password, employeeId } = req.body;
  if (!email || !password || !employeeId) {
    return res.status(400).json({ error: 'Please add all fields' });
  }

  try {
    const adminExists = await Admin.findOne({ email });
    if (adminExists) return res.status(400).json({ error: 'Admin already exists' });

    const admin = await Admin.create({ email, password, employeeId });
    if (admin) {
      res.status(201).json({
        _id: admin.id,
        email: admin.email,
        employeeId: admin.employeeId,
        token: generateToken(admin._id)
      });
    } else {
      res.status(400).json({ error: 'Invalid admin data' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin Login
app.post('/api/auth/admin/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin.id,
        email: admin.email,
        employeeId: admin.employeeId,
        token: generateToken(admin._id)
      });
    } else {
      res.status(401).json({ error: 'Invalid admin credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- API ROUTES ---

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Get predictions for a given date and department
app.get('/api/predictions', protect, async (req, res) => {
  const { date, department } = req.query;
  
  if (!date || !department) {
    return res.status(400).json({ error: 'Date and department are required' });
  }

  try {
    const rawPredictions = await getCrowdPredictions(date, department);
    
    // HARD LIMIT: Maximum people a single department can see per hour
    const MAX_CAPACITY = 80;

    // Fetch actual real-time MongoDB bookings for this specific date and department
    const actualBookings = await Appointment.find({ date, department, status: { $nin: ['Cancelled', 'No-Show'] } });

    // Fuse Machine Learning Walk-in predictions with Actual Database Data
    const enhancedSlots = rawPredictions.map(slot => {
        // Count real reservations
        const realBookingsCount = actualBookings.filter(b => b.timeSlot === slot.time_slot).length;
        
        // Final Remaining Math: Total Capacity minus (WalkIns + DB Bookings)
        let remainingSeats = MAX_CAPACITY - (slot.predicted_patients + realBookingsCount);
        
        let severity_color = "Green";
        let severity_label = "Available";
        
        if (remainingSeats <= 0) {
            remainingSeats = 0;
            severity_color = "Red";
            severity_label = "Waitlist Only";
        } else if (remainingSeats <= 25) {
            severity_color = "Yellow";
            severity_label = "Filling Fast";
        }

        return { ...slot, remainingSeats, severity_color, severity_label };
    });

    res.json({ date, department, slots: enhancedSlots });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

// Book an appointment
app.post('/api/appointments', protect, async (req, res) => {
  const { department, date, timeSlot } = req.body;
  
  if (!department || !date || !timeSlot) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Prevent duplicate department bookings on the same day
    const existingAppointment = await Appointment.findOne({ 
      patientEmail: req.user.email,
      department,
      date,
      status: { $nin: ['Cancelled', 'No-Show'] }
    });
    
    if (existingAppointment) {
      return res.status(400).json({ error: `You have already booked ${department} on this date under slot ${existingAppointment.timeSlot}.` });
    }

    // Fetch user details for patient info on ticket
    const userDetails = await User.findById(req.user._id);

    // We attach patient info from the authenticated user
    const newAppointment = new Appointment({ 
      patientEmail: req.user.email,
      patientName: userDetails?.username || req.user.email,
      patientAge: userDetails?.age || null,
      patientGender: userDetails?.gender || null,
      department, 
      date, 
      timeSlot 
    });
    await newAppointment.save();

    // Trigger Mock WhatsApp/SMS Notification
    sendBookingConfirmation(req.user, newAppointment);

    res.status(201).json({ message: 'Appointment booked successfully', appointment: newAppointment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// Get user appointments with LIVE Queue Math + Estimated Wait Time
app.get('/api/appointments', protect, async (req, res) => {
  try {
    const rawAppointments = await Appointment.find({ patientEmail: req.user.email }).sort({ createdAt: -1 });
    
    const AVG_CONSULT_MINUTES = 8; // Average consultation time per patient

    const appointmentsWithQueue = await Promise.all(rawAppointments.map(async (appt) => {
      let peopleAhead = 0;
      let estimatedWaitMinutes = 0;
      if (appt.status === 'Scheduled') {
         // Count everyone ahead: currently being served OR scheduled before this patient
         // in the same department on the same day (across ALL time slots)
         peopleAhead = await Appointment.countDocuments({
            department: appt.department,
            date: appt.date,
            _id: { $ne: appt._id },
            $or: [
              { status: 'In Progress' },
              { status: 'Scheduled', createdAt: { $lt: appt.createdAt } }
            ]
         });
         estimatedWaitMinutes = peopleAhead * AVG_CONSULT_MINUTES;
      } else if (appt.status === 'In Progress') {
         estimatedWaitMinutes = 0; // Currently being served
      }
      return { ...appt.toObject(), peopleAhead, estimatedWaitMinutes };
    }));

    res.json(appointmentsWithQueue);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Cancel appointment (Patient-side) + Return slot recommendation
app.delete('/api/appointments/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, patientEmail: req.user.email });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    if (appointment.status === 'Completed') return res.status(400).json({ error: 'Cannot cancel completed appointment' });
    
    await Appointment.findByIdAndUpdate(req.params.id, { status: 'Cancelled' });

    // Smart Recommendation: Find the best alternative green slot
    let recommendedSlot = null;
    try {
      const predictions = await getCrowdPredictions(appointment.date, appointment.department);
      const actualBookings = await Appointment.find({ date: appointment.date, department: appointment.department, status: { $ne: 'Cancelled' } });
      const MAX_CAPACITY = 80;
      
      const available = predictions
        .map(slot => {
          const booked = actualBookings.filter(b => b.timeSlot === slot.time_slot).length;
          const remaining = MAX_CAPACITY - (slot.predicted_patients + booked);
          return { ...slot, remaining };
        })
        .filter(s => s.remaining > 25 && s.time_slot !== appointment.timeSlot)
        .sort((a, b) => b.remaining - a.remaining);
      
      if (available.length > 0) recommendedSlot = available[0];
    } catch (e) { /* slot recommendation is best-effort */ }

    res.json({ message: 'Appointment cancelled successfully', recommendedSlot });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

// --- DOCTOR AVAILABILITY (In-memory for hackathon) ---
const doctorAvailability = {};
// Format: { "Cardiology": { available: true, breakSince: null } }

app.get('/api/admin/doctor-status', adminProtect, (req, res) => {
  res.json(doctorAvailability);
});

app.put('/api/admin/doctor-status/:department', adminProtect, (req, res) => {
  const { department } = req.params;
  const { available } = req.body;
  
  doctorAvailability[department] = {
    available: available,
    breakSince: available ? null : new Date().toISOString()
  };
  
  console.log(`[Doctor Toggle] ${department}: ${available ? 'AVAILABLE' : 'ON BREAK'}`);
  res.json({ department, ...doctorAvailability[department] });
});

// Patient-side: check doctor status
app.get('/api/doctor-status', protect, (req, res) => {
  res.json(doctorAvailability);
});

// --- ADMIN: Queue Transfer ---
app.put('/api/admin/appointments/:id/transfer', adminProtect, async (req, res) => {
  const { newDepartment } = req.body;
  if (!newDepartment) return res.status(400).json({ error: 'New department is required' });
  
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    
    const oldDept = appointment.department;
    appointment.department = newDepartment;
    appointment.status = 'Scheduled'; // Reset to scheduled in new dept
    await appointment.save();
    
    console.log(`[Queue Transfer] ${oldDept} → ${newDepartment} for ${appointment._id}`);
    res.json({ message: `Transferred from ${oldDept} to ${newDepartment}`, appointment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to transfer appointment' });
  }
});

// --- ADMIN: No-Show Auto-Skip ---
app.post('/api/admin/no-show-check', adminProtect, async (req, res) => {
  try {
    const NO_SHOW_MINUTES = 10;
    const cutoff = new Date(Date.now() - NO_SHOW_MINUTES * 60 * 1000);
    
    // Find appointments that were admitted but haven't progressed
    const now = new Date();
    const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const noShows = await Appointment.find({
      status: 'Scheduled',
      createdAt: { $lt: cutoff },
      date: localToday
    });
    
    const skippedIds = [];
    for (const appt of noShows) {
      // Check if there are admitted patients in same dept/slot who finished,
      // meaning this patient was "next" but never showed
      const laterPatients = await Appointment.countDocuments({
        department: appt.department,
        date: appt.date,
        timeSlot: appt.timeSlot,
        status: { $in: ['In Progress', 'Completed'] },
        createdAt: { $gt: appt.createdAt }
      });
      
      if (laterPatients > 0) {
        await Appointment.findByIdAndUpdate(appt._id, { status: 'No-Show' });
        skippedIds.push(appt._id);
      }
    }
    
    res.json({ message: `Marked ${skippedIds.length} no-shows`, skippedIds });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check no-shows' });
  }
});

// Admin Route: Get ALL appointments across the hospital
app.get('/api/admin/appointments', adminProtect, async (req, res) => {
  try {
    const appointments = await Appointment.find({}).sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all appointments' });
  }
});

// Admin Route: Update appointment status (Advance Queue)
app.put('/api/admin/appointments/:id/status', adminProtect, async (req, res) => {
  const { status } = req.body;
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    if (status === 'In Progress') {
      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (appointment.date > today) {
        return res.status(400).json({ error: 'Cannot admit a patient for a future date' });
      }
      appointment.admittedAt = new Date();
    }
    
    appointment.status = status;
    await appointment.save();
    
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

