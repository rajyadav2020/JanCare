import React, { useState } from 'react';
import { registerUser, loginUser } from '../api';
import { Activity, Lock, Mail, ArrowRight, User, Phone, CreditCard, Globe, Calendar, Users } from 'lucide-react';
import { translations } from '../translations';

export default function AuthPage({ onAuthSuccess, language, toggleLanguage }) {
  const t = translations[language];
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [adhhar, setAdhhar] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!isLogin && password !== confirmPassword) {
      setError(t.auth_err_nomatch);
      return;
    }

    setLoading(true);

    try {
      let data;
      if (isLogin) {
        data = await loginUser(email, password);
      } else {
        data = await registerUser({ username, email, password, phone, adhhar, age: Number(age), gender });
      }
      
      if (data.token) {
        localStorage.setItem('opd_token', data.token);
        onAuthSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px]"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.012)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

      <button 
        onClick={toggleLanguage}
        className="absolute top-6 right-6 z-20 flex items-center gap-2 text-gray-400 font-semibold bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm text-sm transition-all"
      >
        <Globe className="w-4 h-4" />
        {language === 'en' ? 'हिंदी' : 'English'}
      </button>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img src="/logo.png" alt="JanCare" className="h-14 w-auto rounded-xl" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-white tracking-tight">
          {isLogin ? t.auth_welcome : t.auth_create}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          {t.auth_or}{' '}
          <button 
            onClick={toggleAuthMode} 
            className="font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            {isLogin ? t.auth_toggle_register : t.auth_toggle_login}
          </button>
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/[0.04] backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-white/[0.08]">
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-400">{t.auth_username}</label>
                <div className="mt-1 relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 py-3 sm:text-sm bg-white/[0.04] border border-white/[0.1] rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-400">
                {isLogin ? (language === 'en' ? 'Email or Phone' : 'ईमेल या फ़ोन') : t.auth_email}
              </label>
              <div className="mt-1 relative rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-600" />
                </div>
                <input
                  type={isLogin ? "text" : "email"}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 py-3 sm:text-sm bg-white/[0.04] border border-white/[0.1] rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                  placeholder={isLogin ? "you@example.com or 9876543210" : "you@example.com"}
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-400">{t.auth_aadhaar}</label>
                  <div className="mt-1 relative rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                    </div>
                    <input
                      type="text"
                      required
                      minLength={12}
                      maxLength={12}
                      pattern="\d{12}"
                      value={adhhar}
                      onChange={(e) => setAdhhar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                      className="block w-full pl-10 py-3 sm:text-sm bg-white/[0.04] border border-white/[0.1] rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                      placeholder="123456789012"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-400">{t.auth_phone}</label>
                  <div className="mt-1 relative rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-600" />
                    </div>
                    <input
                      type="tel"
                      required
                      minLength={10}
                      maxLength={10}
                      pattern="\d{10}"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="block w-full pl-10 py-3 sm:text-sm bg-white/[0.04] border border-white/[0.1] rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-400">Age</label>
                  <div className="mt-1 relative rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-600" />
                    </div>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="block w-full pl-10 py-3 sm:text-sm bg-white/[0.04] border border-white/[0.1] rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                      placeholder="25"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400">Gender</label>
                  <div className="mt-1 relative rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                    <select
                      required
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="block w-full pl-10 py-3 sm:text-sm bg-white/[0.04] border border-white/[0.1] rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all appearance-none"
                    >
                      <option value="" className="bg-gray-900">Select</option>
                      <option value="Male" className="bg-gray-900">Male</option>
                      <option value="Female" className="bg-gray-900">Female</option>
                      <option value="Other" className="bg-gray-900">Other</option>
                    </select>
                  </div>
                </div>
              </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-400">{t.auth_pass}</label>
              <div className="mt-1 relative rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-600" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 py-3 sm:text-sm bg-white/[0.04] border border-white/[0.1] rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-400">{t.auth_confirm_pass}</label>
                <div className="mt-1 relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-600" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 py-3 sm:text-sm bg-white/[0.04] border border-white/[0.1] rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  <input id="remember-me" type="checkbox" className="h-4 w-4 text-blue-500 bg-white/5 border-white/10 rounded focus:ring-blue-500" />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                    {t.auth_remember}
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-400 hover:text-blue-300">
                    {t.auth_forgot}
                  </a>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-500 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed border border-blue-400/30"
              >
                {loading ? t.auth_processing : (
                  <span className="flex items-center gap-2">
                    {isLogin ? t.btn_signin_submit : t.btn_signup_submit} <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
