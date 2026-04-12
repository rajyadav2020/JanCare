import React from 'react';
import { Activity, ArrowRight, ShieldCheck, Clock, Zap, Globe, Users, TrendingDown, Sparkles, CheckCircle2 } from 'lucide-react';
import { translations } from '../translations';

export default function LandingPage({ onGetStarted, language, toggleLanguage }) {
  const t = translations[language];

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans selection:bg-blue-500/30 overflow-hidden">
      
      {/* Background Grid + Glow */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.015)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[128px]"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[128px]"></div>
      <div className="fixed top-[30%] right-[20%] w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px]"></div>

      {/* Navbar */}
      <nav className="relative z-20 container mx-auto px-6 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="JanCare" className="h-10 w-auto rounded-xl" />
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-gray-400 font-semibold bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl transition-all border border-white/10 backdrop-blur-sm text-sm"
          >
            <Globe className="w-4 h-4" />
            {language === 'en' ? 'हिंदी' : 'English'}
          </button>
          <button 
            onClick={onGetStarted}
            className="hidden md:flex items-center gap-2 font-bold px-6 py-2.5 bg-white text-gray-900 rounded-xl shadow-lg hover:shadow-white/20 transition-all hover:-translate-y-0.5 text-sm"
          >
            {t.btn_sign_in} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 pt-20 md:pt-28 pb-16 text-center max-w-5xl">
        
        {/* Floating Badge */}
        <div className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 rounded-full bg-blue-500/10 text-blue-400 text-sm font-bold tracking-wide uppercase border border-blue-500/20 backdrop-blur-sm">
          <Sparkles className="w-4 h-4" />
          {t.landing_tag}
        </div>
        
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black mb-8 leading-[1.05] tracking-tighter">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500">
            {t.landing_heading.split('. ').map((part, i) => (
              <React.Fragment key={i}>
                {part}{i < t.landing_heading.split('. ').length - 1 ? '. ' : ''}
                {i < t.landing_heading.split('. ').length - 1 && <br className="hidden md:block"/>}
              </React.Fragment>
            ))}
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
          {t.landing_subheading}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
          <button 
            onClick={onGetStarted}
            className="group px-10 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 border border-blue-400/30"
          >
            {t.btn_get_started} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <a href="#features" className="px-10 py-4 bg-white/5 backdrop-blur-sm text-white rounded-2xl font-bold text-lg border border-white/10 hover:bg-white/10 transition-all">
            {t.btn_learn_more}
          </a>
        </div>

      </main>

      {/* Feature Cards */}
      <section id="features" className="relative z-10 container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-blue-400 font-bold text-sm uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">Smarter Healthcare,<br/>Zero Waiting</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          
          <div className="group bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-sm p-8 rounded-3xl border border-white/[0.08] hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-2">
            <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black mb-3 text-white">{t.feat_1_title}</h3>
            <p className="text-gray-400 leading-relaxed text-sm">{t.feat_1_desc}</p>
            <div className="mt-6 flex items-center gap-2 text-blue-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Learn more</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div className="group bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-sm p-8 rounded-3xl border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-2">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
              <TrendingDown className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black mb-3 text-white">{t.feat_2_title}</h3>
            <p className="text-gray-400 leading-relaxed text-sm">{t.feat_2_desc}</p>
            <div className="mt-6 flex items-center gap-2 text-emerald-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Learn more</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div className="group bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-sm p-8 rounded-3xl border border-white/[0.08] hover:border-amber-500/30 transition-all duration-500 hover:-translate-y-2">
            <div className="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/20 group-hover:bg-amber-500/20 group-hover:scale-110 transition-all duration-300">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black mb-3 text-white">{t.feat_3_title}</h3>
            <p className="text-gray-400 leading-relaxed text-sm">{t.feat_3_desc}</p>
            <div className="mt-6 flex items-center gap-2 text-amber-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Learn more</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

        </div>
      </section>

      {/* Process Flow */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-500/10 to-indigo-500/5 backdrop-blur-sm border border-blue-500/10 rounded-3xl p-10 md:p-14">
          <h2 className="text-3xl md:text-4xl font-black mb-10 text-center tracking-tight">
            Book in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">3 Simple Steps</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black shadow-lg shadow-blue-500/30">1</div>
              <h4 className="font-bold text-lg mb-2">Select Department</h4>
              <p className="text-gray-400 text-sm">Choose from 6 OPD departments like Cardiology, Neurology, and more.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black shadow-lg shadow-indigo-500/30">2</div>
              <h4 className="font-bold text-lg mb-2">Pick Green Slot</h4>
              <p className="text-gray-400 text-sm">Our AI predicts crowd levels. Pick a Green slot and skip the queue entirely.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black shadow-lg shadow-emerald-500/30">3</div>
              <h4 className="font-bold text-lg mb-2">Get QR Pass</h4>
              <p className="text-gray-400 text-sm">Receive an instant digital boarding pass with QR code — no paper, no hassle.</p>
            </div>
          </div>
        </div>
      </section>



      {/* CTA Footer */}
      <section className="relative z-10 container mx-auto px-6 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight">
            Ready to skip the queue?
          </h2>
          <p className="text-gray-400 font-medium mb-8 max-w-xl mx-auto">Join the digital healthcare revolution. Predict, book, and walk straight into your appointment.</p>
          <button 
            onClick={onGetStarted}
            className="group px-10 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all inline-flex items-center gap-3 border border-blue-400/30"
          >
            {t.btn_get_started} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="relative z-10 border-t border-white/[0.05] py-8">
        <p className="text-center text-gray-600 text-sm font-medium">
          © 2026 JanCare · Smart OPD Queue Optimization · Built with ❤️ for India
        </p>
      </footer>

    </div>
  );
}
