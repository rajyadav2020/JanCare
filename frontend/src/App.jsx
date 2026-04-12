import React, { useState, useEffect } from 'react';
import BookingUI from './components/BookingUI';
import ProfileUI from './components/ProfileUI';
import AdminDashboard from './components/AdminDashboard';
import AdminAuthPage from './components/AdminAuthPage';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import { ShieldPlus, LogOut, Globe, ShieldAlert } from 'lucide-react';
import { translations } from './translations';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [activeTab, setActiveTab] = useState('booking');
  const [language, setLanguage] = useState('en');
  const [isAdminAuth, setIsAdminAuth] = useState(false);

  // Hardcode route for admin access
  const isAdminRoute = window.location.pathname === '/admin';

  const t = translations[language];

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('opd_token');
    if (token) {
      setCurrentView('app');
    }
    
    // Check if admin is logged in
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      setIsAdminAuth(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('opd_token');
    setActiveTab('booking'); // Reset tab state to avoid bugs on re-login
    setCurrentView('landing');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAdminAuth(false);
  };

  if (isAdminRoute) {
    if (!isAdminAuth) {
      return <AdminAuthPage onAuthSuccess={() => setIsAdminAuth(true)} />;
    }
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="JanCare" className="h-12 w-auto rounded-lg" />
          </div>
          <button 
            onClick={handleAdminLogout}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold px-4 py-2 border border-indigo-200 rounded-lg transition-colors bg-indigo-50"
          >
            <LogOut className="w-4 h-4" /> Sign Out Staff
          </button>
        </header>
        <main className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
          <AdminDashboard />
        </main>
      </div>
    );
  }

  if (currentView === 'landing') {
    return (
      <LandingPage 
        onGetStarted={() => setCurrentView('auth')} 
        language={language}
        toggleLanguage={toggleLanguage}
      />
    );
  }

  if (currentView === 'auth') {
    return (
      <AuthPage 
        onAuthSuccess={() => setCurrentView('app')} 
        language={language}
        toggleLanguage={toggleLanguage}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.012)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      <div className="fixed top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px]"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px]"></div>

      <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-8 pt-6 md:pt-10">
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="JanCare" className="h-10 w-auto rounded-xl" />
          </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-gray-400 font-semibold bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all border border-white/10 backdrop-blur-sm text-sm"
          >
            <Globe className="w-4 h-4" />
            {language === 'en' ? 'हिंदी' : 'English'}
          </button>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-400 font-semibold transition-colors px-3 py-2 text-sm"
          >
            <LogOut className="w-4 h-4" /> {t.btn_logout}
          </button>
        </div>
      </header>

      <div className="flex justify-center mb-10">
        <div className="bg-white/[0.04] p-1.5 rounded-2xl inline-flex gap-1 backdrop-blur-sm border border-white/[0.08] shadow-sm">
          <button
            className={`py-2.5 px-8 rounded-xl font-bold text-sm transition-all duration-300 ${
              activeTab === 'booking'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/20'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.05]'
            }`}
            onClick={() => setActiveTab('booking')}
          >
            {t.tab_booking}
          </button>
          <button
             className={`py-2.5 px-8 rounded-xl font-bold text-sm transition-all duration-300 ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/20'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.05]'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            {t.tab_profile}
          </button>
        </div>
      </div>

      <main className="bg-white/[0.04] backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden min-h-[600px] border border-white/[0.08]">
        {activeTab === 'booking' ? <BookingUI language={language} /> : <ProfileUI language={language} />}
      </main>
    </div>
  </div>
  );
}

export default App;
