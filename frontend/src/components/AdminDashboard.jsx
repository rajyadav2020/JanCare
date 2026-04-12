import React, { useState, useEffect } from 'react';
import { fetchAllAppointments, updateAppointmentStatus, fetchAdminDoctorStatus, toggleDoctorAvailability, transferAppointment, runNoShowCheck } from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie } from 'recharts';
import { Users, CalendarCheck, Clock, ShieldAlert, TrendingUp, AlertTriangle, Coffee, ArrowRightLeft, UserX, RefreshCw } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const TIME_SLOTS = ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00'];
const DEPARTMENTS = ['Orthopedics', 'Pediatrics', 'Cardiology', 'Dermatology', 'Neurology', 'General Medicine'];

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorStatus, setDoctorStatus] = useState({});
  const [transferModal, setTransferModal] = useState(null); // { apptId, currentDept }
  const [transferTarget, setTransferTarget] = useState('');
  const [noShowResult, setNoShowResult] = useState(null);
  
  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const [selectedDate, setSelectedDate] = useState(getTodayStr());

  useEffect(() => {
    loadData();
    loadDoctorStatus();
    const interval = setInterval(() => {
      loadDataSilent();
      loadDoctorStatus();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const data = await fetchAllAppointments();
      setAppointments(data);
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const loadDataSilent = async () => {
    try {
      const data = await fetchAllAppointments();
      setAppointments(data);
    } catch (err) { /* silent */ }
  };

  const loadDoctorStatus = async () => {
    try {
      const data = await fetchAdminDoctorStatus();
      setDoctorStatus(data);
    } catch (err) { /* silent */ }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  // Feature 3: Doctor Availability Toggle
  const handleToggleDoctor = async (dept) => {
    const current = doctorStatus[dept]?.available !== false; // default is available
    try {
      await toggleDoctorAvailability(dept, !current);
      setDoctorStatus(prev => ({
        ...prev,
        [dept]: { available: !current, breakSince: !current ? null : new Date().toISOString() }
      }));
    } catch (err) {
      console.error('Failed to toggle doctor status', err);
    }
  };

  // Feature 5: Queue Transfer
  const handleTransfer = async () => {
    if (!transferModal || !transferTarget) return;
    try {
      await transferAppointment(transferModal.apptId, transferTarget);
      setAppointments(prev => prev.map(a => 
        a._id === transferModal.apptId ? { ...a, department: transferTarget, status: 'Scheduled' } : a
      ));
      setTransferModal(null);
      setTransferTarget('');
    } catch (err) {
      console.error('Failed to transfer', err);
    }
  };

  // Feature 4: No-Show Auto-Skip
  const handleNoShowCheck = async () => {
    try {
      const result = await runNoShowCheck();
      setNoShowResult(result);
      if (result.skippedIds.length > 0) {
        setAppointments(prev => prev.map(a => 
          result.skippedIds.includes(a._id) ? { ...a, status: 'No-Show' } : a
        ));
      }
      setTimeout(() => setNoShowResult(null), 5000);
    } catch (err) {
      console.error('No-show check failed', err);
    }
  };

  // Stats
  const totalAppointments = appointments.length;
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayAppointments = appointments.filter(a => a.date === today).length;
  const completedToday = appointments.filter(a => a.date === today && a.status === 'Completed').length;
  const noShowTotal = appointments.filter(a => a.status === 'No-Show').length;

  // Charts
  const deptCount = {};
  appointments.forEach(a => { deptCount[a.department] = (deptCount[a.department] || 0) + 1; });
  const chartData = Object.keys(deptCount).map(dept => ({ name: dept, patients: deptCount[dept] })).sort((a, b) => b.patients - a.patients);

  const statusCount = {};
  appointments.forEach(a => { const s = a.status || 'Scheduled'; statusCount[s] = (statusCount[s] || 0) + 1; });
  const statusData = Object.keys(statusCount).map(s => ({ name: s, value: statusCount[s] }));
  const STATUS_COLORS = { 'Scheduled': '#3b82f6', 'In Progress': '#f59e0b', 'Completed': '#10b981', 'Cancelled': '#ef4444', 'No-Show': '#6b7280' };

  // Heatmap
  const heatmapData = {};
  const todayAppts = appointments.filter(a => a.date === today);
  DEPARTMENTS.forEach(dept => {
    heatmapData[dept] = {};
    TIME_SLOTS.forEach(slot => {
      heatmapData[dept][slot] = todayAppts.filter(a => a.department === dept && a.timeSlot === slot && a.status !== 'Cancelled').length;
    });
  });

  const getHeatColor = (count) => {
    if (count === 0) return 'bg-white/[0.02] text-gray-700';
    if (count <= 2) return 'bg-emerald-500/20 text-emerald-400';
    if (count <= 5) return 'bg-amber-500/20 text-amber-400';
    return 'bg-rose-500/20 text-rose-400';
  };

  return (
    <div className="p-8 bg-gray-50/50 min-h-[600px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-600" /> Executive Analytics
          </h2>
          <p className="text-gray-500 text-sm">Real-time overview of hospital OPD load</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNoShowCheck}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all border border-gray-200"
          >
            <UserX className="w-4 h-4" /> Scan No-Shows
          </button>
        </div>
      </div>

      {/* No-Show Result Banner */}
      {noShowResult && (
        <div className={`mb-6 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
          noShowResult.skippedIds.length > 0 ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-green-50 text-green-800 border border-green-200'
        }`}>
          <UserX className="w-4 h-4" />
          {noShowResult.message}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Patients</p>
                <p className="text-2xl font-black text-gray-800">{totalAppointments}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CalendarCheck className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Today's Load</p>
                <p className="text-2xl font-black text-gray-800">{todayAppointments}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl"><TrendingUp className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Completed</p>
                <p className="text-2xl font-black text-gray-800">{completedToday}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="p-3 bg-gray-100 text-gray-600 rounded-xl"><UserX className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">No-Shows</p>
                <p className="text-2xl font-black text-gray-800">{noShowTotal}</p>
              </div>
            </div>
          </div>

          {/* Doctor Availability Panel (Feature 3) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Coffee className="w-5 h-5 text-amber-600" /> Doctor Availability
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {DEPARTMENTS.map(dept => {
                const isAvailable = doctorStatus[dept]?.available !== false;
                return (
                  <button
                    key={dept}
                    onClick={() => handleToggleDoctor(dept)}
                    className={`p-3 rounded-xl border-2 text-center transition-all text-xs font-bold ${
                      isAvailable 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' 
                        : 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 animate-pulse'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${isAvailable ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                    <p className="truncate">{dept}</p>
                    <p className="text-[10px] mt-1 font-medium opacity-70">{isAvailable ? 'Available' : 'On Break'}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-4">Patient Load by Department</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="patients" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-4">Status Distribution</h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                      {statusData.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {statusData.map(s => (
                  <span key={s.name} className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[s.name] || '#94a3b8' }}></span>
                    {s.name} ({s.value})
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Heatmap */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <h3 className="font-bold text-gray-700 mb-1">Today's Crowd Heatmap</h3>
            <p className="text-gray-400 text-xs mb-4">Department × Time Slot density for {today}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-3 text-gray-500 font-bold">Dept</th>
                    {TIME_SLOTS.map(slot => (
                      <th key={slot} className="py-2 px-2 text-gray-500 font-bold text-center">{slot.split(' - ')[0]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DEPARTMENTS.map(dept => (
                    <tr key={dept} className="border-t border-gray-50">
                      <td className="py-2 px-3 font-bold text-gray-700 whitespace-nowrap">{dept}</td>
                      {TIME_SLOTS.map(slot => {
                        const count = heatmapData[dept][slot];
                        return (
                          <td key={slot} className="py-1.5 px-1.5 text-center">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-[11px] font-black transition-all ${getHeatColor(count)}`}>
                              {count}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-4 mt-4 justify-end">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                <span className="w-4 h-4 rounded bg-white border border-gray-200"></span> Empty
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                <span className="w-4 h-4 rounded bg-emerald-100"></span> Low (1-2)
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600">
                <span className="w-4 h-4 rounded bg-amber-100"></span> Medium (3-5)
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600">
                <span className="w-4 h-4 rounded bg-rose-100"></span> High (6+)
              </span>
            </div>
          </div>

          {/* Live Queue Feed + Transfer Modal */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-700">Live Active Queue</h3>
              <div className="flex items-center gap-4">
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase hidden sm:flex">
                  <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} /> Auto-refreshing
                </div>
              </div>
            </div>
            
            {/* Transfer Modal */}
            {transferModal && (
              <div className="mb-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                <p className="text-sm font-bold text-indigo-800 mb-2">
                  <ArrowRightLeft className="w-4 h-4 inline mr-1" />
                  Transfer from {transferModal.currentDept} to:
                </p>
                <div className="flex gap-2">
                  <select
                    value={transferTarget}
                    onChange={(e) => setTransferTarget(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-indigo-200 text-sm font-medium"
                  >
                    <option value="">Select department...</option>
                    {DEPARTMENTS.filter(d => d !== transferModal.currentDept).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <button onClick={handleTransfer} disabled={!transferTarget} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-indigo-700 transition-all">
                    Transfer
                  </button>
                  <button onClick={() => { setTransferModal(null); setTransferTarget(''); }} className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-300 transition-all">
                    ✕
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-y-auto space-y-4 pr-2 custom-scrollbar max-h-[500px]">
              {appointments.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled' && a.status !== 'No-Show' && a.date === selectedDate).slice(0, 25).map((appt) => (
                <div key={appt._id} className={`rounded-xl border overflow-hidden transition-all ${
                  appt.status === 'In Progress' ? 'bg-amber-50/80 border-amber-300 shadow-md shadow-amber-100' : 'bg-white border-gray-200 shadow-sm'
                }`}>
                  {/* Status Strip */}
                  <div className={`px-4 py-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider ${
                    appt.status === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-700'
                  }`}>
                    <span className="flex items-center gap-1.5">
                      {appt.status === 'In Progress' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>}
                      {appt.status || 'Scheduled'}
                    </span>
                    <span className="text-gray-400 font-mono">#{appt._id.slice(-6).toUpperCase()}</span>
                  </div>

                  <div className="p-4">
                    {/* Patient Info Row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ${
                          appt.status === 'In Progress' ? 'bg-amber-200 text-amber-800' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {(appt.patientName || 'P')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{appt.patientName || 'Patient'}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {appt.patientAge && (
                              <span className="text-[11px] text-gray-500 font-medium">{appt.patientAge} yrs</span>
                            )}
                            {appt.patientGender && (
                              <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase">{appt.patientGender}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setTransferModal({ apptId: appt._id, currentDept: appt.department })}
                          className="p-1.5 bg-white text-indigo-600 border border-gray-200 hover:border-indigo-300 rounded-lg transition-all hover:bg-indigo-50" 
                          title="Transfer to another department"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>

                        {(!appt.status || appt.status === 'Scheduled') && (
                           appt.date > today ? (
                            <span className="px-3 py-1.5 bg-gray-100 text-gray-400 border border-gray-200 rounded-lg text-xs font-bold block cursor-not-allowed">
                              Future Booking
                            </span>
                          ) : (
                            <button onClick={() => handleUpdateStatus(appt._id, 'In Progress')} className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white shadow-sm rounded-lg text-xs font-bold transition-all active:scale-95">
                              Admit Patient
                            </button>
                          )
                        )}
                        {appt.status === 'In Progress' && (
                          <button onClick={() => handleUpdateStatus(appt._id, 'Completed')} className="px-3 py-1.5 bg-green-500 hover:bg-green-600 shadow-sm shadow-green-200 text-white rounded-lg text-xs font-bold transition-all active:scale-95 animate-pulse">
                            Finish
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Ticket Details Grid */}
                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Department</p>
                        <p className="text-sm font-bold text-gray-800">{appt.department}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Date</p>
                        <p className="text-sm font-bold text-gray-800">{new Date(appt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Slot</p>
                        <p className="text-sm font-bold text-gray-800">{appt.timeSlot}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {appointments.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled' && a.status !== 'No-Show' && a.date === selectedDate).length === 0 && (
                <p className="text-center text-sm font-medium text-gray-400 mt-10">Queue is empty for {new Date(selectedDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
