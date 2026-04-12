import React, { useState, useEffect, useRef } from 'react';
import { fetchUserAppointments, cancelAppointment, fetchDoctorStatus, bookAppointment } from '../api';
import { Calendar, Users, Clock, History, CheckCircle, Ticket, XCircle, Timer, Volume2, RefreshCw, Coffee, Zap, AlertTriangle, User } from 'lucide-react';
import { translations } from '../translations';
import { QRCodeSVG } from 'qrcode.react';

export default function ProfileUI({ language }) {
  const t = translations[language];
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [doctorStatus, setDoctorStatus] = useState({});
  const [recommendation, setRecommendation] = useState(null); // { apptId, slot }
  const [rebookingId, setRebookingId] = useState(null);
  const pollRef = useRef(null);

  // Feature 1: Live auto-polling every 10 seconds
  useEffect(() => {
    loadAppointments();
    loadDoctorStatus();

    pollRef.current = setInterval(() => {
      loadAppointmentsSilent();
      loadDoctorStatus();
      setLastRefresh(Date.now());
    }, 10000);

    return () => clearInterval(pollRef.current);
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await fetchUserAppointments();
      setAppointments(data);
    } catch (err) {
      console.error("Failed to load appointments", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointmentsSilent = async () => {
    try {
      const data = await fetchUserAppointments();
      setAppointments(data);
    } catch (err) { /* silent */ }
  };

  const loadDoctorStatus = async () => {
    try {
      const data = await fetchDoctorStatus();
      setDoctorStatus(data);
    } catch (err) { /* silent */ }
  };

  // Feature 2: Cancel with smart recommendation
  const handleCancel = async (id) => {
    if (!window.confirm(language === 'en' ? 'Are you sure you want to cancel this appointment?' : 'क्या आप यह अपॉइंटमेंट रद्द करना चाहते हैं?')) return;
    setCancellingId(id);
    try {
      const result = await cancelAppointment(id);
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'Cancelled' } : a));
      
      // Show smart recommendation if available
      if (result.recommendedSlot) {
        const cancelledAppt = appointments.find(a => a._id === id);
        setRecommendation({ 
          apptId: id, 
          slot: result.recommendedSlot, 
          department: cancelledAppt?.department,
          date: cancelledAppt?.date
        });
      }
    } catch (err) {
      console.error("Failed to cancel", err);
    } finally {
      setCancellingId(null);
    }
  };

  // Feature 2b: Rebook recommended slot
  const handleRebook = async () => {
    if (!recommendation) return;
    setRebookingId(recommendation.apptId);
    try {
      await bookAppointment(recommendation.date, recommendation.department, recommendation.slot.time_slot);
      setRecommendation(null);
      loadAppointments(); // Refresh list
    } catch (err) {
      console.error("Failed to rebook", err);
    } finally {
      setRebookingId(null);
    }
  };

  const speakBooking = (appt) => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const lang = language === 'hi' ? 'hi-IN' : 'en-US';
    const text = language === 'en'
      ? `Your appointment is confirmed for ${appt.department} department on ${appt.date} at ${appt.timeSlot}. ${appt.peopleAhead > 0 ? `There are ${appt.peopleAhead} patients ahead of you. Estimated wait time is ${appt.estimatedWaitMinutes} minutes.` : 'You are next in queue!'}`
      : `आपकी अपॉइंटमेंट ${appt.department} विभाग में ${appt.date} को ${appt.timeSlot} पर पुष्टि हो गई है। ${appt.peopleAhead > 0 ? `आपसे पहले ${appt.peopleAhead} मरीज़ हैं। अनुमानित प्रतीक्षा समय ${appt.estimatedWaitMinutes} मिनट है।` : 'आप कतार में अगले हैं!'}`;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    synth.speak(utterance);
  };

  const getTranslatedDeptName = (dept) => {
    const key = `dept_${dept.replace(' ', '_')}`;
    return t[key] || dept;
  };

  const isActive = (status) => status !== 'Completed' && status !== 'Cancelled' && status !== 'No-Show';

  // Queue progress percentage (visual indicator)
  const getQueueProgress = (appt) => {
    if (appt.status === 'In Progress') return 100;
    if (!isActive(appt.status)) return 0;
    const total = (appt.peopleAhead || 0) + 1;
    return Math.round(((total - (appt.peopleAhead || 0)) / total) * 100);
  };

  return (
    <div className="p-8">
      {/* Header with live refresh indicator */}
      <div className="flex items-center justify-between gap-3 mb-8 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">{t.prof_title}</h2>
            <p className="text-sm text-gray-500 font-medium">Your Digital Passes</p>
          </div>
        </div>
        {/* Live Refresh Indicator */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-white/[0.03] px-3 py-1.5 rounded-full border border-white/[0.06]">
          <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} />
          LIVE • Auto-refreshing
        </div>
      </div>

      {/* Smart Recommendation Banner */}
      {recommendation && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl animate-[fadeIn_0.3s_ease-out]">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-blue-300 mb-1">
                {language === 'en' ? '💡 Smart Recommendation' : '💡 स्मार्ट सुझाव'}
              </p>
              <p className="text-xs text-gray-400 mb-3">
                {language === 'en' 
                  ? `A better slot is available! ${recommendation.slot.time_slot} has ${recommendation.slot.remaining} seats remaining — much less crowded.`
                  : `एक बेहतर स्लॉट उपलब्ध है! ${recommendation.slot.time_slot} में ${recommendation.slot.remaining} सीटें बची हैं।`}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleRebook}
                  disabled={rebookingId}
                  className="px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-all disabled:opacity-50"
                >
                  {rebookingId ? 'Booking...' : (language === 'en' ? `Book ${recommendation.slot.time_slot}` : `${recommendation.slot.time_slot} बुक करें`)}
                </button>
                <button
                  onClick={() => setRecommendation(null)}
                  className="px-4 py-2 bg-white/5 text-gray-400 rounded-xl text-xs font-bold hover:bg-white/10 transition-all border border-white/[0.06]"
                >
                  {language === 'en' ? 'Dismiss' : 'बंद करें'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 bg-white/[0.02] rounded-2xl border-2 border-dashed border-white/[0.08]">
          <Calendar className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-500">{t.prof_empty}</p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          {appointments.map((appt) => {
            const isDoctorOnBreak = doctorStatus[appt.department]?.available === false;
            
            return (
            <div key={appt._id} className={`bg-white/[0.04] rounded-2xl overflow-hidden flex flex-col border transition-transform duration-300 ${
               !isActive(appt.status) ? 'opacity-50 grayscale border-white/[0.04]' : 'border-white/[0.08] shadow-xl shadow-black/20 hover:-translate-y-1'
            }`}>
              
              {/* Doctor On Break Banner (Feature 3) */}
              {isActive(appt.status) && isDoctorOnBreak && (
                <div className="px-4 py-2.5 bg-orange-500/10 border-b border-orange-500/20 flex items-center gap-2 text-[11px] font-bold text-orange-400 uppercase tracking-wider">
                  <Coffee className="w-3.5 h-3.5" />
                  {language === 'en' ? 'Doctor on break — Queue paused' : 'डॉक्टर ब्रेक पर — कतार रुकी हुई'}
                </div>
              )}

              {/* No-Show Banner */}
              {appt.status === 'No-Show' && (
                <div className="px-4 py-2.5 bg-red-500/10 border-b border-red-500/20 flex items-center gap-2 text-[11px] font-bold text-red-400 uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {language === 'en' ? 'Missed — You were marked as No-Show' : 'छूट गया — आपको नो-शो चिह्नित किया गया'}
                </div>
              )}

              <div className="flex flex-1">
              {/* Main Ticket Info (Left Side) */}
              <div className="w-2/3 p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-3">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${
                    appt.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    appt.status === 'No-Show' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    appt.status === 'Completed' ? 'bg-white/[0.04] text-gray-500 border-white/[0.08]' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {appt.status === 'Cancelled' || appt.status === 'No-Show' ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                    {appt.status === 'Cancelled' ? (language === 'en' ? 'Cancelled' : 'रद्द') : 
                     appt.status === 'No-Show' ? 'No-Show' :
                     appt.status === 'Completed' ? 'Completed' : t.prof_status}
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive(appt.status) && (
                      <button 
                        onClick={() => speakBooking(appt)}
                        className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                        title={language === 'en' ? 'Read aloud' : 'बोलकर सुनें'}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="text-xs text-gray-600 font-mono">ID: {appt._id.slice(-6).toUpperCase()}</span>
                  </div>
                </div>

                {/* Live Queue Position + Progress Bar (Feature 1) */}
                {isActive(appt.status) && (
                  <>
                    <div className={`mb-2 px-3 py-2.5 rounded-lg flex items-center gap-2 border text-[11px] font-bold uppercase tracking-wider ${
                      appt.status === 'In Progress' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : appt.peopleAhead > 0 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {appt.status === 'In Progress' ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                          NOW SERVING — PROCEED TO ROOM
                        </>
                      ) : appt.peopleAhead > 0 ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> #{appt.peopleAhead + 1} IN QUEUE • {appt.peopleAhead} AHEAD
                          </span>
                          <span className="flex items-center gap-1 text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            <Timer className="w-3 h-3" /> ~{appt.estimatedWaitMinutes} MIN
                          </span>
                        </div>
                      ) : (
                        <>
                          <Users className="w-3 h-3 text-blue-400" /> YOU ARE NEXT IN QUEUE!
                        </>
                      )}
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-white/[0.04] rounded-full h-1.5 mb-4 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          appt.status === 'In Progress' ? 'bg-emerald-500' : 
                          appt.peopleAhead === 0 ? 'bg-blue-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${getQueueProgress(appt)}%` }}
                      ></div>
                    </div>
                  </>
                )}
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white">
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.book_dept}</p>
                      <p className="font-bold text-xl leading-tight">{getTranslatedDeptName(appt.department)}</p>
                    </div>
                  </div>

                  {/* Patient Info for Doctor */}
                  {(appt.patientName || appt.patientAge || appt.patientGender) && (
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                      <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-md border border-indigo-500/20">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-bold text-gray-300">{appt.patientName}</span>
                        {appt.patientAge && (
                          <span className="text-gray-500 font-medium">{appt.patientAge} yrs</span>
                        )}
                        {appt.patientGender && (
                          <span className="px-2 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded-md text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {appt.patientGender}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.06]">
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Date</p>
                        <p className="font-bold text-gray-300 text-sm">{new Date(appt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Slot</p>
                        <p className="font-bold text-gray-300 text-sm whitespace-nowrap">{appt.timeSlot.split(' - ')[0]}</p>
                      </div>
                    </div>
                  </div>

                  {/* Cancel Button */}
                  {isActive(appt.status) && (
                    <button 
                      onClick={() => handleCancel(appt._id)}
                      disabled={cancellingId === appt._id}
                      className="w-full mt-2 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 hover:border-red-500/20 transition-all disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {cancellingId === appt._id ? (language === 'en' ? 'Cancelling...' : 'रद्द हो रहा है...') : (language === 'en' ? 'Cancel Appointment' : 'अपॉइंटमेंट रद्द करें')}
                    </button>
                  )}
                </div>
              </div>

              {/* QR Code Tear-away Stub (Right Side) */}
              <div className="w-1/3 bg-white/[0.02] border-l-2 border-dashed border-white/[0.08] relative flex flex-col items-center justify-center p-4">
                <div className="absolute -top-3 -left-3 w-6 h-6 bg-[#030712] rounded-full"></div>
                <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-[#030712] rounded-full"></div>

                <div className="bg-white p-2 rounded-xl shadow-md border border-gray-200 mb-3 transform hover:scale-110 transition-transform">
                   <QRCodeSVG 
                      value={`aiims://verify/${appt._id}?dept=${encodeURIComponent(appt.department)}&time=${encodeURIComponent(appt.timeSlot)}`} 
                      size={85} 
                      level={"M"}
                      fgColor={"#1e1b4b"} 
                   />
                </div>
                
                <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-600 tracking-widest text-center">
                  <Ticket className="w-3 h-3" /> Digital Pass
                </div>
              </div>
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
}
