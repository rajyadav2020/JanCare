import React, { useState } from 'react';
import { adminLogin, adminRegister } from '../api';
import { ShieldAlert, LogIn, UserPlus } from 'lucide-react';

export default function AdminAuthPage({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const data = await adminLogin(email, password);
        localStorage.setItem('admin_token', data.token);
      } else {
        const data = await adminRegister(email, password, employeeId);
        localStorage.setItem('admin_token', data.token);
      }
      onAuthSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-16 w-auto flex items-center justify-center">
          <img src="/logo.png" alt="JanCare" className="h-16 w-auto rounded-2xl" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Hospital Staff Portal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          {isLogin ? 'Sign in to access the analytics dashboard' : 'Register a new staff account'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm text-center font-medium">
                {error}
              </div>
            )}
            
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-300">Employee ID</label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="appearance-none block w-full px-3 py-3 border border-slate-600 rounded-xl bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all"
                    placeholder="e.g. AIIMS-1042"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300">Official Email</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-slate-600 rounded-xl bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all"
                  placeholder="staff@hospital.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-slate-600 rounded-xl bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all hover:scale-[1.02]"
              >
                {isLogin ? (
                  <><LogIn className="w-5 h-5 mr-2" /> Sign In</>
                ) : (
                  <><UserPlus className="w-5 h-5 mr-2" /> Register Staff</>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {isLogin ? "Need a staff account? Register here" : "Already have an account? Sign in"}
            </button>
          </div>
          
          <div className="mt-8 text-center border-t border-slate-700 pt-6">
            <button
              onClick={() => window.location.href = '/'}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              ← Return to Patient Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
