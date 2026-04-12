import React, { useState, useEffect } from 'react';
import { fetchPredictions, bookAppointment, fetchDoctorStatus } from '../api';
import { Calendar, Users, Clock, ArrowRight, CheckCircle, AlertTriangle, Coffee, TrendingDown } from 'lucide-react';
import { translations } from '../translations';

const DEPARTMENTS = [
  'Orthopedics', 'Pediatrics', 'Cardiology', 
  'Dermatology', 'Neurology', 'General Medicine'
];

export default function BookingUI({ language }) {
  const t = translations[language];

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState('');
  const [doctorStatus, setDoctorStatus] = useState({});

  useEffect(() => {
    const getSlots = async () => {
      setLoading(true);
      try {
        const data = await fetchPredictions(date, department);
        setPredictions(data.slots || []);
        setSelectedSlot(null);
        setBookingSuccess(false);
        setError('');
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    getSlots();
  }, [date, department]);

  // Load doctor availability
  useEffect(() => {
    const loadDoctorStatus = async () => {
      try {
        const data = await fetchDoctorStatus();
        setDoctorStatus(data);
      } catch (e) { /* silent */ }
    };
    loadDoctorStatus();
    const interval = setInterval(loadDoctorStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // Find the least crowded slot for peak hour recommendation
  const getBestAlternative = () => {
    if (!selectedSlot || !predictions.length) return null;
    const greenSlots = predictions.filter(s => s.severity_color === 'Green' && s.time_slot !== selectedSlot.time_slot);
    if (greenSlots.length === 0) return null;
    return greenSlots.sort((a, b) => b.remainingSeats - a.remainingSeats)[0];
  };

  const handleBook = async () => {
    if (!selectedSlot) return;
    setError('');
    try {
      await bookAppointment(date, department, selectedSlot.time_slot);
      setBookingSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to book appointment');
    }
  };

  const getSeverityStyle = (color) => {
    switch (color) {
      case 'Green': return 'bg-emerald-500/10 border-emerald-500 text-emerald-400 hover:bg-emerald-500/20';
      case 'Yellow': return 'bg-amber-500/10 border-amber-500 text-amber-400 hover:bg-amber-500/20';
      case 'Red': return 'bg-rose-500/10 border-rose-500 text-rose-400 opacity-60 cursor-not-allowed';
      default: return 'bg-white/5 border-gray-600 text-gray-400';
    }
  };

  const isSlotInPast = (slotDateStr, timeSlot) => {
    const now = new Date();
    const [yyyy, mm, dd] = slotDateStr.split('-').map(Number);
    const slotD = new Date(yyyy, mm - 1, dd);
    const todayD = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (slotD < todayD) return true;
    if (slotD > todayD) return false;

    const startStr = timeSlot.split(' - ')[0]; // e.g. "08:00"
    const [startHour, startMin] = startStr.split(':').map(Number);
    
    if (startHour < now.getHours()) return true;
    if (startHour === now.getHours() && startMin < now.getMinutes()) return true;
    
    return false;
  };

  const getTranslatedDeptName = (dept) => {
    const key = `dept_${dept.replace(' ', '_')}`;
    return t[key] || dept;
  };

  return (
    <div className="p-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar Controls */}
      <div className="w-full md:w-1/3 space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-400 mb-2">
            <Users className="w-4 h-4" /> {t.book_dept}
          </label>
          <select 
            value={department} 
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-white/[0.1] bg-white/[0.04] shadow-sm focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-white outline-none hover:border-white/20"
          >
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept} className="bg-gray-900 text-white">{getTranslatedDeptName(dept)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-400 mb-2">
            <Calendar className="w-4 h-4" /> {t.book_date}
          </label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-white/[0.1] bg-white/[0.04] shadow-sm focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-white outline-none hover:border-white/20 [color-scheme:dark]"
          />
        </div>

        <div className="p-5 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 rounded-2xl border border-blue-500/10">
          <h3 className="font-bold text-blue-400 flex items-center gap-2 mb-2.5">
            <Clock className="w-4 h-4" /> {t.book_predictor_title}
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed font-medium">
            {t.book_predictor_desc}
          </p>
        </div>
      </div>

      {/* Main Content - Time Slots */}
      <div className="w-full md:w-2/3">
        <h2 className="text-2xl font-black text-white mb-6 pb-4 border-b border-white/[0.06] flex justify-between items-center tracking-tight">
          {t.book_slots_title}
          <span className="text-xs font-bold text-gray-400 px-3 py-1.5 bg-white/[0.04] rounded-full border border-white/[0.08]">
            {date} • {getTranslatedDeptName(department)}
          </span>
        </h2>

        {/* Doctor On Break Warning */}
        {doctorStatus[department]?.available === false && (
          <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center gap-3 text-[12px]">
            <Coffee className="w-5 h-5 text-orange-400 shrink-0" />
            <div>
              <p className="font-bold text-orange-400">{language === 'en' ? `${department} doctor is currently on break` : `${department} के डॉक्टर अभी ब्रेक पर हैं`}</p>
              <p className="text-gray-500 mt-0.5">{language === 'en' ? 'You can still book, but the queue is paused until the doctor returns.' : 'आप अभी भी बुक कर सकते हैं, लेकिन कतार रुकी हुई है।'}</p>
            </div>
          </div>
        )}

        {/* Peak Hour Warning (Feature 6) */}
        {selectedSlot && selectedSlot.severity_color === 'Yellow' && (() => {
          const alt = getBestAlternative();
          return alt ? (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3 text-[12px]">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-amber-400">
                  {language === 'en' ? '⚠️ This slot is historically busy' : '⚠️ यह स्लॉट ऐतिहासिक रूप से व्यस्त है'}
                </p>
                <p className="text-gray-400 mt-0.5">
                  {language === 'en' 
                    ? `Consider ${alt.time_slot} instead — ${alt.remainingSeats} seats available, much less crowded.`
                    : `${alt.time_slot} पर विचार करें — ${alt.remainingSeats} सीटें उपलब्ध, बहुत कम भीड़।`}
                </p>
                <button
                  onClick={() => setSelectedSlot(alt)}
                  className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[11px] font-bold hover:bg-emerald-500/20 transition-all"
                >
                  <TrendingDown className="w-3 h-3" />
                  {language === 'en' ? `Switch to ${alt.time_slot}` : `${alt.time_slot} पर बदलें`}
                </button>
              </div>
            </div>
          ) : null;
        })()}
        
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {predictions.map((slot, idx) => {
              const inPast = isSlotInPast(date, slot.time_slot);
              const isDisabled = slot.severity_color === 'Red' || inPast;
              
              return (
              <button
                key={idx}
                disabled={isDisabled}
                onClick={() => setSelectedSlot(slot)}
                className={`p-4 rounded-2xl border-l-[6px] text-left transition-all duration-300 ${inPast ? 'bg-white/[0.02] border-gray-700 text-gray-600 opacity-50 cursor-not-allowed hidden md:block' : getSeverityStyle(slot.severity_color)} ${
                  selectedSlot?.time_slot === slot.time_slot && !isDisabled ? 'ring-[3px] ring-offset-2 ring-offset-gray-900 ring-blue-500 shadow-xl shadow-blue-500/10 transform scale-[1.03] z-10 block' : 'hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20'
                }`}
              >
                <div className="font-bold text-lg">{slot.time_slot}</div>
                <div className="text-sm font-medium flex justify-between items-center mt-1">
                  <span className="flex items-center gap-2">
                    {inPast ? 'Expired Slot' : slot.severity_label}
                    {selectedSlot?.time_slot === slot.time_slot && <CheckCircle className="w-4 h-4" />}
                  </span>
                  {!inPast && slot.remainingSeats !== undefined && (
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.1]">
                      {slot.remainingSeats} Seats
                    </span>
                  )}
                </div>
              </button>
            )})}
          </div>
        )}

        {/* Action Area */}
        <div className="mt-8 pt-6 border-t border-white/[0.06]">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-medium">
              {error}
            </div>
          )}
          {bookingSuccess ? (
            <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              <div>
                <p className="font-bold">{t.book_success_title}</p>
                <p className="text-sm text-emerald-400/70">{t.book_success_desc}</p>
              </div>
            </div>
          ) : (
            <button
              onClick={handleBook}
              disabled={!selectedSlot}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                selectedSlot 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:-translate-y-1 active:scale-[0.98] border border-blue-400/30' 
                  : 'bg-white/[0.03] text-gray-600 cursor-not-allowed border border-white/[0.06]'
              }`}
            >
              {selectedSlot ? `${t.book_btn_confirm} ${selectedSlot.time_slot}` : t.book_btn_select}
              {selectedSlot && <ArrowRight className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
